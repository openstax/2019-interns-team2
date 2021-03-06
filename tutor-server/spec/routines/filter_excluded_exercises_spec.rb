require 'rails_helper'

RSpec.describe FilterExcludedExercises, type: :routine, speed: :medium do

  let(:exercises) { 5.times.map { FactoryBot.create :content_exercise } }

  before do
    Settings::Exercises.excluded_ids = excluded_ids
  end

  after(:all) do
    Settings::Exercises.excluded_ids = ''
  end

  let(:args) do
    {
      exercises: exercises, course: course,
      additional_excluded_numbers: additional_excluded_numbers
    }
  end

  context 'with admin exclusions' do
    let(:excluded_ids) { [exercises.first.uid, exercises.second.number].join(', ') }

    context 'with a course with excluded exercises' do
      let(:course)             { FactoryBot.create :course_profile_course }
      let!(:excluded_exercise) do
        FactoryBot.create :course_content_excluded_exercise,
                           course: course, exercise_number: exercises.third.number
      end

      context 'with additional_excluded_numbers' do
        let(:additional_excluded_numbers) { [exercises.fourth.number] }

        it 'returns exercises not excluded by admin, course or additional' do
          result = described_class[**args]
          expect(result).to eq exercises.last(1)
        end
      end

      context 'without additional_excluded_numbers' do
        let(:additional_excluded_numbers) { [] }

        it 'returns exercises not excluded by admin or course' do
          result = described_class[**args]
          expect(result).to eq exercises.last(2)
        end
      end
    end

    context 'without a course' do
      let(:course) { nil }

      context 'with additional_excluded_numbers' do
        let(:additional_excluded_numbers) { [exercises.fourth.number] }

        it 'returns exercises not excluded by admin or additional' do
          result = described_class[**args]
          expect(result).to eq [exercises.third, exercises.fifth]
        end
      end

      context 'without additional_excluded_numbers' do
        let(:additional_excluded_numbers) { [] }

        it 'returns exercises not excluded by admin' do
          result = described_class[**args]
          expect(result).to eq exercises.last(3)
        end
      end
    end
  end

  context 'without admin exclusions' do
    let(:excluded_ids) { '' }

    context 'with a course with excluded exercises' do
      let(:course)             { FactoryBot.create :course_profile_course }
      let!(:excluded_exercise) do
        FactoryBot.create :course_content_excluded_exercise,
                           course: course, exercise_number: exercises.third.number
      end

      context 'with additional_excluded_numbers' do
        let(:additional_excluded_numbers) { [exercises.fourth.number] }

        it 'returns exercises not excluded by course or additional' do
          result = described_class[**args]
          expect(result).to eq exercises.first(2) + exercises.last(1)
        end
      end

      context 'without additional_excluded_numbers' do
        let(:additional_excluded_numbers) { [] }

        it 'returns exercises not excluded by course' do
          result = described_class[**args]
        expect(result).to eq exercises.first(2) + exercises.last(2)
        end
      end
    end

    context 'without a course' do
      let(:course) { nil }

      context 'with additional_excluded_numbers' do
        let(:additional_excluded_numbers) { [exercises.fourth.number] }

        it 'returns exercises not excluded by additional' do
          result = described_class[**args]
          expect(result).to eq exercises.first(3) + exercises.last(1)
        end
      end

      context 'without additional_excluded_numbers' do
        let(:additional_excluded_numbers) { [] }

        it 'returns all exercises' do
          result = described_class[**args]
        expect(result).to eq exercises
        end
      end
    end
  end

end
