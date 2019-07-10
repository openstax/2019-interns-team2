module Manager::CourseDetails
  protected

  def get_course_details
    @course = CourseProfile::Models::Course.find(params[:id])
    @periods = @course.periods
    @teachers = @course.teachers
                       .preload(role: { profile: :account })
                       .sort_by { |ss| ss.last_name || ss.name }
    @students = @course.students
                       .preload(role: { profile: :account })
                       .sort_by { |ss| ss.last_name || ss.name }
    @ecosystems = Content::ListEcosystems[]

    @course_ecosystem = nil
    ecosystem_model = @course.ecosystem
    return if ecosystem_model.nil?

    ecosystem_strategy = ::Content::Strategies::Direct::Ecosystem.new(ecosystem_model)
    @course_ecosystem = ::Content::Ecosystem.new(strategy: ecosystem_strategy)

    @catalog_offerings = Catalog::ListOfferings[]
  end
end
