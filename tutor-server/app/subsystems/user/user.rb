module User
  class User
    include Wrapper
    include GlobalID::Identification

    class << self
      def all(strategy_class: ::User::Strategies::Direct::User)
        verify_and_return strategy_class.all, klass: self, error: StrategyError
      end

      def create(account_id:, strategy_class: ::User::Strategies::Direct::User)
        account_id = verify_and_return account_id, klass: Integer

        verify_and_return strategy_class.create(account_id: account_id), klass: self,
                                                                         error: StrategyError
      end

      def create!(account_id:, strategy_class: ::User::Strategies::Direct::User)
        account_id = verify_and_return account_id, klass: Integer

        verify_and_return strategy_class.create!(account_id: account_id), klass: self,
                                                                          error: StrategyError
      end

      def find(*args, strategy_class: ::User::Strategies::Direct::User)
        flat_args = args.first.is_a?(Array) ? args.first : args
        string_args = flat_args.map(&:to_s)

        # convention that anonymous user has an ID of -1, helps with globalID lookup
        if string_args == ["-1"]
          anonymous
        elsif string_args.include?("-1")
          raise "Cannot find anonymous users (id of -1) intermixed with other searches"
        else
          verify_and_return(strategy_class.find(*args), klass: self, error: StrategyError)
        end
      end

      def find_by_account(account, strategy_class: ::User::Strategies::Direct::User)
        account = verify_and_return account, klass: OpenStax::Accounts::Account
        verify_and_return strategy_class.find_by_account(account),
                          klass: self, allow_nil: true, error: StrategyError
      end

      def find_by_username(username, strategy_class: ::User::Strategies::Direct::User)
        username = verify_and_return username, klass: String
        verify_and_return strategy_class.find_by_username(username),
                          klass: self, allow_nil: true, error: StrategyError
      end

      def anonymous(strategy_class: ::User::Strategies::Direct::AnonymousUser)
        verify_and_return strategy_class.anonymous, klass: self, error: StrategyError
      end
    end

    def id
      verify_and_return @strategy.id, klass: Integer, allow_nil: true, error: StrategyError
    end

    def account
      verify_and_return @strategy.account, klass: OpenStax::Accounts::Account, error: StrategyError
    end

    def username
      verify_and_return @strategy.username, klass: String, allow_nil: true, error: StrategyError
    end

    def first_name
      verify_and_return @strategy.first_name, klass: String, allow_nil: true, error: StrategyError
    end

    def last_name
      verify_and_return @strategy.last_name, klass: String, allow_nil: true, error: StrategyError
    end

    def full_name
      verify_and_return @strategy.full_name, klass: String, allow_nil: true, error: StrategyError
    end

    def name
      verify_and_return @strategy.name, klass: String, error: StrategyError
    end

    def title
      verify_and_return @strategy.title, klass: String, allow_nil: true, error: StrategyError
    end

    def role
      verify_and_return @strategy.role, klass: String, allow_nil: true, error: StrategyError
    end

    def roles
      verify_and_return @strategy.roles, klass: Entity::Role, error: StrategyError
    end

    def is_human?
      !!@strategy.is_human?
    end

    def is_application?
      !!@strategy.is_application?
    end

    def is_signed_in?
      !is_anonymous?
    end

    def is_anonymous?
      !!@strategy.is_anonymous?
    end

    def is_admin?
      !!@strategy.is_admin?
    end

    def is_customer_service?
      !!@strategy.is_customer_service?
    end

    def is_content_analyst?
      !!@strategy.is_content_analyst?
    end

    def is_test
      !!@strategy.is_test
    end

    def is_researcher?
      !!@strategy.is_researcher?
    end

    def faculty_status
      verify_and_return @strategy.faculty_status, klass: String, error: StrategyError
    end

    def school_type
      verify_and_return @strategy.school_type, klass: String, error: StrategyError
    end

    def ui_settings
      verify_and_return @strategy.ui_settings, klass: Hash, allow_nil: true, error: StrategyError
    end

    def viewed_tour_stats
      verify_and_return @strategy.viewed_tour_stats, klass: Array, allow_nil: true, error: StrategyError
    end

    def salesforce_contact_id
      verify_and_return @strategy.salesforce_contact_id, klass: String, allow_nil: true, error: StrategyError
    end

    def uuid
      verify_and_return @strategy.uuid, klass: String, allow_nil: true, error: StrategyError
    end

    # Necessary, at least temporarily, so we can assign users to external polymorphics,
    # like task_plan owner, tasking_plan target and FinePrint signatures
    def to_model
      verify_and_return @strategy.to_model, klass: ::User::Models::Profile, error: StrategyError
    end
  end
end
