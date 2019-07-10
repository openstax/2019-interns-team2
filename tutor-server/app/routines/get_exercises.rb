class GetExercises

  lev_routine transaction: :no_transaction, express_output: :exercise_search

  uses_routine GetCourseEcosystem, as: :get_ecosystem
  uses_routine FilterExcludedExercises, as: :filter
  uses_routine GetEcosystemPoolsByPageIdsAndPoolTypes, as: :get_ecosystem_pools

  # Returns Content::Exercises filtered "by":
  #   :ecosystem or :course
  #   :exercise_ids (defaults to all)
  #   :page_ids (defaults to all)
  #   :pool_types (defaults to all)
  #
  # returns course-specific exclusion information with the exercises (if :course provided)

  def exec(ecosystem: nil, course: nil, page_ids: nil, exercise_ids: nil, pool_types: nil)
    raise ArgumentError, "Either :ecosystem or :course must be provided" \
      if ecosystem.nil? && course.nil?

    ecosystem ||= run(:get_ecosystem, course: course).outputs.ecosystem

    pools_map = run(:get_ecosystem_pools, ecosystem: ecosystem,
                                          page_ids: page_ids,
                                          pool_types: pool_types).outputs.pools_map

    excl_exercise_numbers_set = Set.new(course.excluded_exercises.pluck(:exercise_number)) \
      unless course.nil?

    # Preload exercises, pages and teks tags
    all_pools = pools_map.values.flatten
    all_exercise_ids = (exercise_ids || all_pools.flat_map(&:exercise_ids)).uniq
    all_content_exercises = Content::Models::Exercise
      .where(id: all_exercise_ids)
      .preload(:page, tags: :teks_tags)
    all_exercises = all_content_exercises.map { |ce| Content::Exercise.new strategy: ce.wrap }
    all_exercises_by_id = all_exercises.index_by(&:id)

    # Build map of exercise uids to representations, with pool type
    exercise_representations = pools_map.each_with_object({}) do |(pool_type, pools), hash|
      pool_exercise_ids = pools.flat_map(&:exercise_ids).uniq
      pool_exercises = all_exercises_by_id.values_at(*pool_exercise_ids).compact
      exercises = run(:filter, exercises: pool_exercises).outputs.exercises

      exercises.each do |exercise|
        unless hash.has_key?(exercise.uid)
          hash[exercise.uid] = Api::V1::ExerciseRepresenter.new(exercise).to_hash
          hash[exercise.uid]['pool_types'] = []
          hash[exercise.uid]['is_excluded'] = excl_exercise_numbers_set.include?(exercise.number) \
            unless course.nil?
        end

        hash[exercise.uid]['pool_types'] << pool_type
      end
    end

    outputs.exercises = all_exercises
    outputs.exercise_search = Hashie::Mash.new(items: exercise_representations.values)
  end

end
