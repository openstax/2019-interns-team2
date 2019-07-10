DEFAULT_PATTERN = '{prefix}{base}{view}'

settings =
  views:
    profile: DEFAULT_PATTERN
    prevalidate: DEFAULT_PATTERN
    dashboard: DEFAULT_PATTERN
    task: DEFAULT_PATTERN
    registration: DEFAULT_PATTERN
    progress: DEFAULT_PATTERN
    loading: DEFAULT_PATTERN
    login: DEFAULT_PATTERN
    student_id: DEFAULT_PATTERN
    logout: DEFAULT_PATTERN
    default: '{prefix}{base}'
    close: '{prefix}'
    'second-semester-registration': DEFAULT_PATTERN

module.exports = settings
