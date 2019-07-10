require 'rails_helper'

RSpec.describe CourseMembership::GetRoleCourses, type: :routine do
  let(:course_1)        { FactoryBot.create :course_profile_course }
  let(:course_1_period) { FactoryBot.create :course_membership_period, course: course_1 }

  let(:course_2)        { FactoryBot.create :course_profile_course }
  let(:course_2_period) { FactoryBot.create :course_membership_period, course: course_2 }

  let(:course_3)        { FactoryBot.create :course_profile_course }
  let(:course_3_period) { FactoryBot.create :course_membership_period, course: course_3 }

  let(:role_a) { FactoryBot.create :entity_role }
  let(:role_b) { FactoryBot.create :entity_role }
  let(:role_c) { FactoryBot.create :entity_role }

  before do
    CourseMembership::AddTeacher[course: course_1,        role: role_a]
    CourseMembership::AddStudent[period: course_1_period, role: role_a]

    CourseMembership::AddStudent[period: course_2_period, role: role_b]

    CourseMembership::AddTeacher[course: course_3,        role: role_c]
  end

  it 'can find courses for student roles given a singular role' do
    courses = described_class[roles: role_a, types: :student]
    expect(courses).to contain_exactly(course_1)
  end

  it 'can find courses for multiple student roles' do
    courses = described_class[roles: [role_a, role_b], types: :student]
    expect(courses).to contain_exactly(course_1, course_2)

    courses = described_class[roles: [role_a, role_c], types: :student]
    expect(courses).to contain_exactly(course_1)
  end

  it 'can find courses for roles without restrict type' do
    courses = described_class[roles: [role_a], types: [:student, :teacher, :any]]
    expect(courses).to contain_exactly(course_1)
  end

  it 'can find courses for roles limited to teacher types' do
    courses = described_class[roles: [role_a, role_b, role_c], types: [:teacher]]
    expect(courses).to contain_exactly(course_1, course_3)
  end

  it 'does not find courses where the role is an inactive student' do
    role_b.student.destroy
    courses = described_class[roles: [role_a, role_b], types: [:student]]
    expect(courses).to contain_exactly(course_1)
  end

  it 'does not find courses where the role is a deleted teacher' do
    role_c.teacher.destroy
    courses = described_class[roles: [role_a, role_c], types: [:teacher]]
    expect(courses).to contain_exactly(course_1)
  end

end
