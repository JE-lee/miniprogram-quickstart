
let event = (function() {
  let events = {},
    ret = {
      listen(name, handler) {
        if (!name) return
        events[name] = events[name] || []
        events[name].push(handler)
      },
      emit(name, ...data) {
        let handlers = events[name]
        handlers.forEach((handler) => {
          if (typeof handler === 'function') {
            handler(...data)
          }
        })
      },
      /*不传入handle ,则为删除name 的所有已经绑定的事件 */
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
