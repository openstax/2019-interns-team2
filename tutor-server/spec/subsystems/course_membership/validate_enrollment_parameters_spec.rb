require 'rails_helper'

RSpec.describe CourseMembership::ValidateEnrollmentParameters, type: :routine do

  let(:course)     { FactoryBot.create :course_profile_course }
  let(:period)     { FactoryBot.create :course_membership_period, course: course }
  let(:book)       { FactoryBot.create :content_book }
  let!(:ecosystem) do
    ecosystem = Content::Ecosystem.new(strategy: book.ecosystem.wrap)
    AddEcosystemToCourse[course: course, ecosystem: ecosystem]
    ecosystem
  end

  let(:user)       do
    profile = FactoryBot.create :user_profile
    strategy = ::User::Strategies::Direct::User.new(profile)
    ::User::User.new(strategy: strategy)
  end

  it "returns the period if both book_uuid and enrollment_code are valid" do
    expect( described_class[book_uuid: book.uuid, enrollment_code: period.enrollment_code] ).to(
      eq(period)
    )
  end

  it "returns invalid_enrollment_code error when requesting with random uuid / enrollment code" do
    result = described_class.call(book_uuid: 'unknown', enrollment_code: 'yo momma')
    expect(result.errors.first.code).to eq :invalid_enrollment_code
  end

  it "returns invalid_enrollment_code error if book_uuid is valid but enrollment_code is not" do
    result = described_class.call(book_uuid: book.uuid, enrollment_code: 'yo momma')
    expect(result.errors.first.code).to eq :invalid_enrollment_code
  end

  it "returns preview_course error if the associated period's course is a preview course" do
    course.update_attribute :is_preview, true
    result = described_class.call(
      book_uuid: "doesn't matter", enrollment_code: period.enrollment_code
    )
    expect(result.errors.first.code).to eq :preview_course
  end

  it "returns course_ended error if the associated period's course has ended" do
    course.update_attribute :ends_at, Time.current.yesterday
    result = described_class.call(
      book_uuid: "doesn't matter", enrollment_code: period.enrollment_code
    )
    expect(result.errors.first.code).to eq :course_ended
  end

  it "returns enrollment_code_does_not_match_book error" +
     " if book_uuid is invalid but enrollment_code is valid" do
    result = described_class.call(book_uuid: 'hackme', enrollment_code: period.enrollment_code)
    expect(result.errors.first.code).to eq :enrollment_code_does_not_match_book
  end

end
