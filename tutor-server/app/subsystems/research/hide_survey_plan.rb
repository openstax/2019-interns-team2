class Research::HideSurveyPlan

  lev_routine

  def exec(survey_plan:)
    return if survey_plan.is_hidden?

    survey_plan.update_attributes(hidden_at: Time.now)
    transfer_errors_from(survey_plan, {type: :verbatim}, true)

    survey_plan.surveys.update_all(hidden_at: Time.now)
  end
end
