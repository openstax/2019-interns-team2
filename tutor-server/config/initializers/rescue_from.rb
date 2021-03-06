# coding: utf-8
secrets = Rails.application.secrets
OpenStax::RescueFrom.configure do |config|
  config.raise_exceptions = Rails.application.config.consider_all_requests_local

  config.app_name = 'Tutor'
  config.contact_name = secrets.exception[:contact_name]

  # Notify devs using sentry-raven
  config.notify_proc = ->(proxy, controller) do
    extra = {
      error_id: proxy.error_id,
      class: proxy.name,
      message: proxy.message,
      first_line_of_backtrace: proxy.first_backtrace_line,
      cause: proxy.cause,
      dns_name: resolve_ip(controller.request.remote_ip)
    }
    extra.merge!(proxy.extras) if proxy.extras.is_a? Hash

    Raven.capture_exception(proxy.exception, extra: extra)
  end
  config.notify_background_proc = ->(proxy) do
    extra = {
      error_id: proxy.error_id,
      class: proxy.name,
      message: proxy.message,
      first_line_of_backtrace: proxy.first_backtrace_line,
      cause: proxy.cause
    }
    extra.merge!(proxy.extras) if proxy.extras.is_a? Hash

    Raven.capture_exception(proxy.exception, extra: extra)
  end
  require 'raven/integrations/rack'
  config.notify_rack_middleware = Raven::Rack

  # config.html_error_template_path = 'errors/any'
  # config.html_error_template_layout_name = 'application'
end

# OpenStax::RescueFrom.register_exception('ExampleException',
#                                         status: :not_found,
#                                         notify: true,
#                                         extras: ->(e) { {} })

OpenStax::RescueFrom.register_exception(
  'CoursesTeach::InvalidTeachToken',
  message: 'You are trying to join a course as an instructor, but the information you provided ' +
           'is either out of date or does not correspond to an existing course.',
  status: :not_found,
  notify: false
)

OpenStax::RescueFrom.register_exception(
  'CoursesTeach::UserIsStudent',
  message: (
    <<-HTML.strip_heredoc
      <h3>Sorry, you can't enroll as a teacher in your course</h3>
       The URL you’re using is for instructor access to OpenStax Tutor Beta, but you’re signed
       in to a student account.
       Contact <a href="mailto:support@openstax.org">Support</a> if you need help.
    HTML
  ).html_safe,
  status: :forbidden,
  notify: false,
  sorry: false
)

OpenStax::RescueFrom.register_exception(
  'ShortCodeNotFound',
  status: :not_found,
  notify: false
)

OpenStax::RescueFrom.register_exception(
  'OpenStax::Salesforce::UserMissing',
  # only notify when real data involved (only time it really needs admin attention)
  notify: secrets[:salesforce][:allow_use_of_real_data]
)

OpenStax::RescueFrom.register_exception(
  'OpenStax::Biglearn::Api::JobFailed',
  notify: true # Change this to false once we are confident that Biglearn jobs work properly
)

# Exceptions in controllers are not automatically reraised in production-like environments
ActionController::Base.use_openstax_exception_rescue

# RescueFrom always reraises background exceptions so that the background job may properly fail
ActiveJob::Base.use_openstax_exception_rescue
