
var event = (function() {
  var events = {},
    offlineStack = {},	// 离线事件，
    ret = {
      listen(name, handler) {
        if (!name) return
        events[name] = events[name] || []
        events[name].push(handler)

        let stack = offlineStack[name]
        if (stack) {
          stack.forEach(fn => fn())
          stack = null
        }
      },
      emit(name, ...data) {
        var handlers = events[name]

        if (!handlers || !handlers.length) {
          offlineStack[name] = offlineStack[name] || []
          offlineStack[name].push(() => this.emit(name, ...data))
          return
        }

        handlers.forEach((handler) => {
          if (typeof handler === 'function') {
            handler(...data)
          }
        })
      },
      remove(name, handler) {
        let handlers = events[name]
        if (!handlers || !handlers.length) return
        if (handler) {
          let index = handlers.indexOf(handler)
          if (index !== -1) {
            handlers.splice(index, 1)
          }
        } else {
          handlers.length = 0
        }
      }
    }

  return ret
})()


export default {
  addListener: function(name, handler) {
    event.listen(name, handler)

    return this
  },

  removeListener: function(name, handler) {
    event.remove(name, handler)

    return this
  },

  emit: function(name, ...data) {
    event.emit(name, ...data)

    return this
  },

  removeAllListener: function(name) {
    event.remove(name)
    return this
  }
}
