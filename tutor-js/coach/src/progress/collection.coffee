EventEmitter2 = require 'eventemitter2'
_ = require 'underscore'
api = require '../api'

local = {}
channel = new EventEmitter2 wildcard: true

apiChannelName = 'courseDashboard'

load = (id, data) ->
  local[id] = data
  channel.emit("load.#{id}", {data})

update = (eventData) ->
  {data, config, response} = eventData
  load(config.topic, data or response.data)

fetch = (id) ->
  eventData = {data: {id: id}, status: 'loading'}

  channel.emit("fetch.#{id}", eventData)
  api.channel.emit("#{apiChannelName}.#{id}.fetch.send", {id: id})

get = (id) ->
  local[id]

getFilteredChapters = (id, uuids = []) ->
  progresses = get(id)
  return unless progresses?
  {chapters} = progresses

  _.chain(chapters)
    .map((chapter) ->
      chapter.pages = _.reject(chapter.pages, (page) ->
        _.indexOf(uuids, page.uuid) > -1
      )
      return null if _.isEmpty chapter.pages
      chapter
    )
    .compact()
    .value()

init = ->
  api.channel.on("#{apiChannelName}.*.*.receive.success", update)

module.exports = {fetch, get, getFilteredChapters, init, channel}
