module OpenStax
  module Payments

    class ClientError < StandardError
      attr_reader :original

      def initialize(msg, original=$!)
        super(msg)
        @original = original
        set_backtrace(original.backtrace) if original.present?
      end

      def inspect
        [super, @original.try(:inspect)].compact.join(" ")
      end

      def message
        [super, "(#{@original.try(:message) || 'no details'})"].join(" ")
      end
    end

    class RemoteError < StandardError
      attr_reader :original, :status

      def initialize(msg: nil, status: nil, original:$!)
        super(msg)
        @original = original
        @status = status || original.try(:response).try(:status)
        set_backtrace(original.backtrace) if original.present?
      end

      def inspect
        [super, @status.inspect, @original.try(:inspect)].compact.join(" ")
      end

      def message
        [ super,
          "#{@status || 'status-less'} error response from Payments",
          "(#{@original.try(:message) || 'no details'})"
        ].join(" ")
      end
    end

  end
end
