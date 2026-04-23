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

ActiveRecord::Schema[8.1].define(version: 2026_04_23_070000) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "connected_accounts", force: :cascade do |t|
    t.text "access_token"
    t.datetime "created_at", null: false
    t.datetime "expires_at"
    t.string "provider"
    t.text "refresh_token"
    t.string "uid"
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["user_id"], name: "index_connected_accounts_on_user_id"
  end

  create_table "email_insights", force: :cascade do |t|
    t.string "category"
    t.float "confidence"
    t.datetime "created_at", null: false
    t.bigint "email_id", null: false
    t.text "key_points"
    t.text "priority_reason"
    t.integer "priority_score"
    t.text "reasoning"
    t.text "reply_suggestion"
    t.text "summary"
    t.datetime "updated_at", null: false
    t.index ["email_id"], name: "index_email_insights_on_email_id", unique: true
  end

  create_table "emails", force: :cascade do |t|
    t.text "body"
    t.datetime "created_at", null: false
    t.string "external_id"
    t.string "provider"
    t.datetime "received_at"
    t.string "sender"
    t.string "subject"
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["user_id", "provider", "external_id"], name: "index_emails_on_user_id_and_provider_and_external_id", unique: true
    t.index ["user_id"], name: "index_emails_on_user_id"
  end

  create_table "rules", force: :cascade do |t|
    t.string "action"
    t.datetime "created_at", null: false
    t.string "field"
    t.string "operator"
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.string "value"
    t.index ["user_id"], name: "index_rules_on_user_id"
  end

  create_table "tasks", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "due_date"
    t.bigint "email_id", null: false
    t.string "priority"
    t.string "status"
    t.string "title"
    t.datetime "updated_at", null: false
    t.index ["email_id"], name: "index_tasks_on_email_id"
  end

  create_table "users", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.datetime "remember_created_at"
    t.datetime "reset_password_sent_at"
    t.string "reset_password_token"
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  add_foreign_key "connected_accounts", "users"
  add_foreign_key "email_insights", "emails"
  add_foreign_key "emails", "users"
  add_foreign_key "rules", "users"
  add_foreign_key "tasks", "emails"
end
