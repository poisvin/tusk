# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.1].define(version: 2026_02_04_080947) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "active_storage_attachments", force: :cascade do |t|
    t.string "name", null: false
    t.string "record_type", null: false
    t.bigint "record_id", null: false
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.string "key", null: false
    t.string "filename", null: false
    t.string "content_type"
    t.text "metadata"
    t.string "service_name", null: false
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.datetime "created_at", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "notes", force: :cascade do |t|
    t.string "title"
    t.text "content"
    t.integer "category"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "notes_tags", id: false, force: :cascade do |t|
    t.bigint "note_id", null: false
    t.bigint "tag_id", null: false
  end

  create_table "notes_tasks", id: false, force: :cascade do |t|
    t.bigint "note_id", null: false
    t.bigint "task_id", null: false
    t.index ["note_id", "task_id"], name: "index_notes_tasks_on_note_id_and_task_id", unique: true
    t.index ["task_id", "note_id"], name: "index_notes_tasks_on_task_id_and_note_id"
  end

  create_table "tags", force: :cascade do |t|
    t.string "name"
    t.string "color"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "tags_tasks", id: false, force: :cascade do |t|
    t.bigint "task_id", null: false
    t.bigint "tag_id", null: false
  end

  create_table "task_updates", force: :cascade do |t|
    t.bigint "task_id", null: false
    t.text "content", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["task_id"], name: "index_task_updates_on_task_id"
  end

  create_table "tasks", force: :cascade do |t|
    t.string "title"
    t.text "description"
    t.date "scheduled_date"
    t.time "start_time"
    t.time "end_time"
    t.integer "status"
    t.integer "priority"
    t.integer "category"
    t.integer "recurrence"
    t.boolean "remind"
    t.boolean "carried_over"
    t.date "original_date"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "recurrence_parent_id"
    t.string "weekly_days", default: [], array: true
    t.index ["recurrence_parent_id"], name: "index_tasks_on_recurrence_parent_id"
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "task_updates", "tasks"
end
