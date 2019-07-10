module Api::V1::Courses::Cc::Teacher

  class PageRepresenter < ::Roar::Decorator

    include ::Roar::JSON
    include Representable::Coercion

    property :id,
             type: String,
             readable: true,
             writeable: false,
             schema_info: {
               required: true
             }

    property :title,
             type: String,
             readable: true,
             writeable: false,
             schema_info: {
               required: true
             }

    property :uuid,
             type: String,
             readable: true,
             writeable: false

    property :version,
             type: String,
             readable: true,
             writeable: false

    property :book_location,
             as: :chapter_section,
             type: Array,
             writeable: false,
             readable: true,
             schema_info: {
               required: true
             }

    property :completed,
             type: Integer,
             readable: true,
             writeable: false,
             schema_info: {
               required: true
             }

    property :in_progress,
             type: Integer,
             readable: true,
             writeable: false,
             schema_info: {
               required: true
             }

    property :not_started,
             type: Integer,
             readable: true,
             writeable: false,
             schema_info: {
               required: true
             }

    property :original_performance,
            type: Float,
            readable: true,
            writeable: false

    property :spaced_practice_performance,
            type: Float,
            readable: true,
            writeable: false

  end

end
