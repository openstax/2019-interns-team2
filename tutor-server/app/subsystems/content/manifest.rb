module Content
  class Manifest

    include Wrapper

    def self.from_yaml(yaml, strategy_class: ::Content::Strategies::Generated::Manifest)
      yaml = verify_and_return yaml, klass: String
      strategy = verify_and_return strategy_class.from_yaml(yaml), klass: strategy_class,
                                                                   error: StrategyError
      new(strategy: strategy)
    end

    def to_h
      verify_and_return @strategy.to_h, klass: Hash, error: StrategyError
    end

    def to_yaml
      verify_and_return @strategy.to_yaml, klass: String, error: StrategyError
    end

    def title
      verify_and_return @strategy.title, klass: String, error: StrategyError
    end

    def books
      verify_and_return @strategy.books, klass: ::Content::Manifest::Book, error: StrategyError
    end

    def errors
      verify_and_return @strategy.errors, klass: String, error: StrategyError
    end

    def valid?
      !!@strategy.valid?
    end

    # For the following 3 methods, the array returned can contain both Strings and nils
    def update_books!
      verify_and_return @strategy.update_books!, klass: Array, error: StrategyError
    end

    def update_exercises!
      verify_and_return @strategy.update_exercises!, klass: Array, error: StrategyError
    end

    def discard_exercises!
      verify_and_return @strategy.discard_exercises!, klass: Array, error: StrategyError
    end

  end
end
