import { useReducer, useEffect } from 'react'
import { useHistory } from 'react-router-dom'

import { useStore } from '@app/store'

const initialState = {
  isFetching: false,
  error: null,
}

const reducer = (state, { type, payload }) => {
  switch (type) {
    case 'FETCH_START':
      return { ...state, isFetching: true }
    case 'FETCH_SUCCESS':
      return { ...state, isFetching: false }
    case 'FETCH_FAILURE':
      return {
        ...state,
        isFetching: false,
        error: payload,
      }
    default:
      return state
  }
}

const useInitialProps = (getInitialProps, preload = false) => {
  const [state, dispatch] = useReducer(reducer, initialState)
  const [, storeDispatch] = useStore()
  const history = useHistory()

  useEffect(() => {
    let didCancel = false

    const loadData = () => {
      if (didCancel === true) {
        return
      }

      dispatch({ type: 'FETCH_START' })

      getInitialProps(storeDispatch)
        .then(() => dispatch({ type: 'FETCH_SUCCESS', payload: true }))
        .catch((err) => dispatch({ type: 'FETCH_FAILURE', payload: err }))
    }

    if (history.action !== 'POP' || preload === true) {
      loadData()
    }

    return () => {
      didCancel = true
    }
  }, [])

  return state
}

export default useInitialProps
