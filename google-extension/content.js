console.log("ok")
const url = "https://lalang-haole.herokuapp.com"
const AudioContext = window.AudioContext || window.webkitAudioContext;
const ctx = new AudioContext();

const controller = {
  popup : null,
  data : "",
  lang : "vi",
  setPopup(node){
    if(node instanceof Element){
      this.popup = node
    }
  },
  getPopup(){
    return this.popup
  },
  deletePopup(){
    this.popup = null
    return
  },

  controlBtns : [], /* start/stop btn, 3 speed btn (1x, 1.25x, 1.5x) */
}

const btnCss = `
  background-color: #bb53ff;
  border: 2px solid black;
  border-radius: 5px;
  font-weight: bold;
  margin: 0 2px;
  z-index: 1000
`

// utils function
const createElement = (tagName, children, cssText, options=null) => {
  try {
    const E = document.createElement(tagName)
    E.style.cssText = cssText
    // attribute
    if(options){
      Object.keys(options).forEach(key => E.setAttribute(key, options[key]))
    }
    // children
    if(children instanceof Element){ /* children is 1 Element */
      E.appendChild(children)

    } else if(typeof children === "string") { /* children is 1 string */
      const textNode = document.createTextNode(children)
      E.appendChild(textNode)

    } else if(Array.isArray(children)){ /* children is an array (of Element or string) */
      children.forEach(node => {

        if(node instanceof Element){
          E.appendChild(node)
        } else if (typeof node === "string"){

          const textNode = document.createTextNode(node)
          E.appendChild(textNode)
        }
      })
    }
    return E  
  } catch (error) {
    throw error
  }
}

const render = node => document.getElementsByTagName("body")[0].appendChild(node)
// 

// components

// main btn
const startOrStop = createElement(
  'button',
  'La làng',
  btnCss
)
startOrStop.addEventListener("click", function(e){
  console.log("La lang btn clicked")
  console.log(`lang: ${controller.lang} \n data: ${controller.data}`)

  // send to server
  fetch(`${url}/to-speak/${controller.lang}`, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data: controller.data })
  })
  .then(res => res.arrayBuffer())
  .then(data => ctx.decodeAudioData(data))
  .then(decodedAudio => {
    const player = ctx.createBufferSource()
    player.buffer = decodedAudio
    player.connect(ctx.destination)
    player.start(ctx.currentTime)
  })

  // delete Element if exist
  const E = controller.getPopup()
  if(E){
    E.parentNode.removeChild(E)
    controller.deletePopup()
  }
}, true)
// 


// speed controller
const [normalSpeed, mediumSpeed, fastSpeed] = ['1x', '1.25x', '1.5x'].map(name => createElement(
  'button',
  name,
  btnCss
))
// 

// select btn
const en = createElement(
  'option',
  'en',
  "",
  { value: "en" }
)
const vi = createElement(
  'option',
  'vi',
  "",
  { value: "vi", selected: true }
)
const selector = createElement(
  'select',
  [vi, en],
  ""
)
selector.addEventListener('change', function(e){
  controller.lang = e.target.value
})


// functions

// this function should be change

// document.addEventListener('mousedown', e => {
//   // delete Element if exist
//   const E = controller.getPopup()
//   if(E){
//     E.parentNode.removeChild(E)
//     controller.deletePopup()
//   }
// })

document.addEventListener('mouseup', function(event){
  if(!controller.getPopup()){
    const selection = window.getSelection()
    const data = selection.toString()
    if(!!data.length){
      const baseRange = selection.getRangeAt(0)
      const range = baseRange.cloneRange()
      range.collapse(false);
      const dummy = document.createElement("span");
      range.insertNode(dummy);
      const rect = dummy.getBoundingClientRect();
      const x = rect.left, y = rect.top;
      dummy.parentNode.removeChild(dummy);
      
      // store data
      controller.data = data

      // create element and render
      const E = createElement(
        "div", 
        [selector, startOrStop, normalSpeed, mediumSpeed, fastSpeed], 
        `
          position: absolute; top: ${10 + y + document.documentElement.scrollTop}px; 
          left: ${x}px; z-index: 999; padding: 5px; border-radius: 5px;
          background-color: white; border: 1px solid gray; display: flex;
          flex-wrap: wrap, align-content: space-between; justify-content: space-between
        `
      )
      render(E)
      // store Element to controller
      controller.setPopup(E)
    }
  }
}, true)

