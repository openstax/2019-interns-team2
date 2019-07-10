class Research::CompleteSurvey

  lev_routine

  def exec(survey:, response:)
    survey.update_attributes(survey_js_response: response, completed_at: Time.now)
    transfer_errors_from(survey, {type: :verbatim})
  end

end
