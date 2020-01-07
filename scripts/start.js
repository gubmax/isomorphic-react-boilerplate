const { fork } = require('child_process')

const paths = require('../config/paths')
const {
  consoleOutput, consoleSuccessMsg, consoleAppLink, consoleServerLink,
} = require('../config/etc/console')

const workersArr = [
  {
    name: 'start:app',
    display: () => consoleOutput('INFO', 'Webpack-dev-server started!'),
  },
  {
    name: 'start:server',
    display: () => consoleOutput('INFO', 'Development server started!'),
  },
]

let completeWorkersCount = 0
let isNotFirstCompilling = false

const onMessage = (display) => {
  const consoleMsg = () => {
    consoleSuccessMsg()
    consoleAppLink()
    consoleServerLink()
  }

  if (isNotFirstCompilling) {
    consoleMsg()
    return
  }

  display()
  completeWorkersCount += 1

  if (completeWorkersCount === workersArr.length) {
    consoleMsg()
    isNotFirstCompilling = true
  }
}

const spawnWorker = (name, display) => (
  fork(`${paths.appPath}/scripts/${name}.js`)
    .on('message', () => onMessage(display))
)

workersArr.forEach(({ name, display }) => {
  spawnWorker(name, display)
})
