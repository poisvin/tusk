# Recurring Tasks Fix Plan

**Goal:** Fix recurring task generation and synchronization bugs

**Issues Identified:**

1. **Weekly tasks bug**: Logic skips first week and doesn't correctly generate tasks for selected days
2. **Monthly tasks**: Only generates 1 month ahead, should be 1 year
3. **Recurrence change not syncing**: Changing recurrence type (weekday→weekend) doesn't regenerate children
4. **Child edits not propagating**: Editing a child task doesn't sync to siblings

---

## Rules (from user)

| Recurrence | Generation Period | Logic |
|------------|------------------|-------|
| Daily | 1 month | Every day |
| Weekdays | 1 month | Monday-Friday only |
| Weekly | 1 month | Selected days each week |
| Weekends | 1 month | Saturday-Sunday only |
| Monthly | 1 year | Same date each month |

**Sync Rule:** When timing or day changes on ANY task in series, ALL future tasks should update.

---

## Implementation Plan

### Task 1: Fix RecurringTaskService date generation

**Files:**
- `app/services/recurring_task_service.rb`
- `spec/services/recurring_task_service_spec.rb`

**Changes:**
1. Fix weekly logic to properly iterate through weeks and generate for selected days
2. Change monthly to generate 1 year ahead instead of 1 month
3. Fix weekdays/weekends to start from correct date

### Task 2: Add recurrence change detection to Task model

**Files:**
- `app/models/task.rb`

**Changes:**
1. Add `saved_change_to_recurrence?` and `saved_change_to_weekly_days?` to sync trigger
2. When recurrence type changes, delete future children and regenerate

### Task 3: Allow child tasks to propagate changes to series

**Files:**
- `app/models/task.rb`

**Changes:**
1. When editing a child task (has `recurrence_parent_id`), find parent and trigger sync from parent
2. Or: sync directly to all siblings with future dates

### Task 4: Add method to regenerate series on recurrence change

**Files:**
- `app/services/recurring_task_service.rb`
- `app/models/task.rb`

**Changes:**
1. Add `regenerate_series` method that:
   - Deletes all future incomplete children
   - Regenerates based on new recurrence settings
2. Call this when recurrence type or weekly_days changes

### Task 5: Write comprehensive tests

**Files:**
- `spec/services/recurring_task_service_spec.rb`
- `spec/models/task_spec.rb`

**Test cases:**
- Daily: generates 30 days
- Weekdays: generates ~22 days (only Mon-Fri)
- Weekly with days: generates 4-5 occurrences per selected day
- Weekends: generates ~8 days (only Sat-Sun)
- Monthly: generates 12 occurrences (1 year)
- Changing time syncs to all future tasks
- Changing recurrence type regenerates series
- Editing child task syncs to siblings

### Task 6: Test and commit

---

## Key Code Changes

### RecurringTaskService - Fix weekly logic

```ruby
def calculate_dates_until(end_date)
  dates = []
  current_date = @task.scheduled_date

  case @task.recurrence
  when "daily"
    while (current_date += 1.day) <= end_date
      dates << current_date
    end
  when "weekly"
    if @task.weekly_days.present? && @task.weekly_days.any?
      # Generate for each selected day for each week
      while current_date <= end_date
        week_dates = dates_for_weekly_days(current_date)
        dates.concat(week_dates.select { |d| d > @task.scheduled_date && d <= end_date })
        current_date += 1.week
      end
    else
      while (current_date += 1.week) <= end_date
        dates << current_date
      end
    end
  when "monthly"
    year_ahead = @task.scheduled_date + 1.year
    actual_end = [end_date, year_ahead].max
    while (current_date += 1.month) <= actual_end
      dates << current_date
    end
  # ... weekdays/weekends stay same
  end

  dates.uniq.sort
end
```

### Task model - Detect recurrence changes

```ruby
def should_sync_children?
  (saved_change_to_start_time? || saved_change_to_end_time? ||
   saved_change_to_title? || saved_change_to_description? ||
   saved_change_to_priority? || saved_change_to_category?) &&
  !saved_change_to_status?
end

def should_regenerate_children?
  saved_change_to_recurrence? || saved_change_to_weekly_days?
end

after_update :regenerate_recurring_children, if: :should_regenerate_children?

def regenerate_recurring_children
  return if recurrence_parent_id.present?

  # Delete future incomplete children
  recurrence_children.where('scheduled_date > ?', Date.today)
                     .where.not(status: :done)
                     .destroy_all

  # Regenerate
  RecurringTaskService.new(self).generate_month_ahead
end
```

---

**Estimated tasks:** 6
**Ready for approval?**
