{Testing, expect, sinon, _, ReactTestUtils} = require 'shared/specs/helpers'

{CourseNameBase} = require 'navigation/course-name'

describe 'CourseNameBase Component', ->

  it 'renders course.description()', ->
    props =
      course:
        description: -> 'My Course'

    Testing.renderComponent( CourseNameBase, {props}).then ({dom}) ->
      expect(dom.textContent).equal('My Course')
