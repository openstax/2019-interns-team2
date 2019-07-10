module Api::V1

  class EcosystemBookRepresenter < Roar::Decorator
    include Roar::JSON

    property :id,
             type: String,
             writeable: false,
             readable: true,
             schema_info: {
               required: false,
               description: 'The id of the book'
             }

    property :uuid,
             type: String,
             writeable: false,
             readable: true,
             schema_info: {
               required: false,
               description: 'The uuid of the book, e.g. "95e61258-2faf-41d4-af92-f62e1414175a@3"'
             }

    property :title,
             type: String,
             writeable: false,
             readable: true,
             schema_info: {
               required: true,
               description: 'The title of the book, e.g. "Physics"'
             }

    property :version,
             type: String,
             writeable: false,
             readable: true,
             schema_info: {
               required: true,
               description: 'The version of the book'
             }
  end

end
