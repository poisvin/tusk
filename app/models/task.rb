class Task < ApplicationRecord
  has_and_belongs_to_many :tags

  # Self-referential association for recurring tasks
  belongs_to :recurrence_parent, class_name: 'Task', optional: true
  has_many :recurrence_children, class_name: 'Task', foreign_key: 'recurrence_parent_id', dependent: :destroy
  has_many :task_updates, dependent: :destroy
  has_and_belongs_to_many :notes

  validates :title, presence: true
  validates :scheduled_date, presence: true

  enum :status, { backlog: 0, in_progress: 1, partial: 2, done: 3 }
  enum :priority, { low: 0, medium: 1, high: 2 }
  enum :category, { personal: 0, official: 1 }
  enum :recurrence, { one_time: 0, daily: 1, weekly: 2, monthly: 3, weekdays: 4, weekends: 5 }

  scope :for_date, ->(date) { where(scheduled_date: date) }
  scope :incomplete, -> { where.not(status: :done) }
  scope :carried_over, -> { where(carried_over: true) }

  before_create :adjust_date_for_recurrence, if: :should_adjust_date?
  after_create :generate_recurring_occurrences, if: :should_generate_occurrences?
  after_update :sync_recurring_series, if: :should_sync_series?
  after_update :regenerate_recurring_children, if: :should_regenerate_children?

  # Get all tasks in this recurrence series
  def recurrence_series
    if recurrence_parent_id.present?
      Task.where(recurrence_parent_id: recurrence_parent_id).or(Task.where(id: recurrence_parent_id))
    else
      Task.where(recurrence_parent_id: id).or(Task.where(id: id))
    end
  end

  # Get future tasks in this series
  def future_occurrences
    recurrence_series.where('scheduled_date > ?', scheduled_date)
  end

  private

  def should_adjust_date?
    # Adjust date for recurring tasks that aren't children
    !one_time? && recurrence_parent_id.nil?
  end

  def adjust_date_for_recurrence
    return unless scheduled_date

    case recurrence
    when 'weekdays'
      # If scheduled on weekend, move to next Monday
      unless (1..5).include?(scheduled_date.wday)
        self.scheduled_date = next_weekday(scheduled_date)
      end
    when 'weekends'
      # If scheduled on weekday, move to next Saturday
      unless [0, 6].include?(scheduled_date.wday)
        self.scheduled_date = next_weekend_day(scheduled_date)
      end
    when 'weekly'
      # If weekly_days specified and current day not in list, move to next matching day
      if weekly_days.present? && weekly_days.any?
        current_day = scheduled_date.strftime('%A').downcase
        unless weekly_days.map(&:downcase).include?(current_day)
          self.scheduled_date = next_weekly_day(scheduled_date)
        end
      end
    end
  end

  def next_weekday(from_date)
    date = from_date
    date += 1.day until (1..5).include?(date.wday)
    date
  end

  def next_weekend_day(from_date)
    date = from_date
    date += 1.day until [0, 6].include?(date.wday)
    date
  end

  def next_weekly_day(from_date)
    return from_date unless weekly_days.present?

    day_offsets = {
      'sunday' => 0, 'monday' => 1, 'tuesday' => 2, 'wednesday' => 3,
      'thursday' => 4, 'friday' => 5, 'saturday' => 6
    }
    target_wdays = weekly_days.map { |d| day_offsets[d.downcase] }.compact

    date = from_date
    date += 1.day until target_wdays.include?(date.wday)
    date
  end

  def should_generate_occurrences?
    # Only generate for parent tasks (not children) that have recurrence
    !one_time? && recurrence_parent_id.nil?
  end

  def generate_recurring_occurrences
    RecurringTaskService.new(self).generate_month_ahead
  end

  def should_sync_series?
    # Sync if time or core fields changed (but not status or recurrence)
    (saved_change_to_start_time? || saved_change_to_end_time? ||
     saved_change_to_title? || saved_change_to_description? ||
     saved_change_to_priority? || saved_change_to_category?) &&
    !saved_change_to_status? && !saved_change_to_recurrence? && !saved_change_to_weekly_days? &&
    (recurrence_parent_id.present? || recurrence_children.exists?) # Part of a series
  end

  def should_regenerate_children?
    # Regenerate if recurrence type or weekly_days changed
    (saved_change_to_recurrence? || saved_change_to_weekly_days?) &&
    recurrence_parent_id.nil? # Only parent can regenerate
  end

  def sync_recurring_series
    sync_attrs = {
      start_time: start_time,
      end_time: end_time,
      title: title,
      description: description,
      priority: Task.priorities[priority],
      category: Task.categories[category]
    }

    if recurrence_parent_id.present?
      # This is a child task - sync to parent and all future siblings
      parent = recurrence_parent
      parent.update_columns(sync_attrs) if parent

      # Sync to all siblings with future dates
      Task.where(recurrence_parent_id: recurrence_parent_id)
          .where('scheduled_date > ?', scheduled_date)
          .update_all(sync_attrs)
    else
      # This is a parent task - sync to all future children
      recurrence_children.where('scheduled_date > ?', scheduled_date)
                         .update_all(sync_attrs)
    end
  end

  def regenerate_recurring_children
    RecurringTaskService.new(self).regenerate_series
  end
end
