class AddNewBiglearnFields < ActiveRecord::Migration[4.2]
  def change
    add_column :content_ecosystems, :tutor_uuid, :uuid, null: false, default: 'gen_random_uuid()'
    add_column :content_books, :tutor_uuid, :uuid, null: false, default: 'gen_random_uuid()'
    add_column :content_chapters, :tutor_uuid, :uuid, null: false, default: 'gen_random_uuid()'
    add_column :content_pages, :tutor_uuid, :uuid, null: false, default: 'gen_random_uuid()'

    add_column :course_profile_courses, :uuid, :uuid, null: false, default: 'gen_random_uuid()'
    add_column :course_membership_periods, :uuid, :uuid, null: false, default: 'gen_random_uuid()'
    add_column :course_membership_students, :uuid, :uuid, null: false, default: 'gen_random_uuid()'
    add_column :tasks_tasks, :uuid, :uuid, null: false, default: 'gen_random_uuid()'
    add_column :tasks_tasked_exercises, :uuid, :uuid, null: false, default: 'gen_random_uuid()'

    add_column :content_ecosystems, :sequence_number, :integer, null: false, default: 0
    add_column :course_profile_courses, :sequence_number, :integer, null: false, default: 0

    remove_column :course_profile_courses, :biglearn_excluded_pool_uuid, :string

    remove_column :user_profiles, :exchange_read_identifier, :string
    remove_column :user_profiles, :exchange_write_identifier, :string

    add_index :content_ecosystems, :tutor_uuid, unique: true
    add_index :content_books, :tutor_uuid, unique: true
    add_index :content_chapters, :tutor_uuid, unique: true
    add_index :content_pages, :tutor_uuid, unique: true

    add_index :course_profile_courses, :uuid, unique: true
    add_index :course_membership_periods, :uuid, unique: true
    add_index :course_membership_students, :uuid, unique: true
    add_index :tasks_tasks, :uuid, unique: true
    add_index :tasks_tasked_exercises, :uuid, unique: true
  end
end
