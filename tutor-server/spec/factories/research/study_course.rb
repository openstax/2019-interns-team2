FactoryBot.define do
  factory :research_study_course, class: '::Research::Models::StudyCourse' do
    association :study, factory: :research_study
    association :course, factory: :course_profile_course
  end
end
