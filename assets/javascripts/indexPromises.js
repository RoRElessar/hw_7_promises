(function () {

  const endpoints = {
    getAllUsers: 'https://jsonplaceholder.typicode.com/users',
    getUserPosts: 'https://jsonplaceholder.typicode.com/posts?userId=',
    getPostComments: 'https://jsonplaceholder.typicode.com/comments?postId='
  }

  const getAllUsersButton = document.getElementById('get-all-users')
  const allUsers = document.getElementById('all-users')
  const userPostsList = document.getElementById('user-posts')
  const postCommentsList = document.getElementById('post-comments')

  getAllUsersButton.addEventListener('click', function (e) {
    serverCall(endpoints.getAllUsers)
      .then(
        response => {
          let users = JSON.parse(response)

          createList(allUsers, users, 'user')
        },
          error => console.log(error)
      )
    e.preventDefault()
  })

  document.addEventListener('click', function (e) {
    if (e.target && e.target.className === 'list-group-item user') {
      const users = document.getElementsByClassName('user')
      const userId = e.target.getAttribute('data-id')

      e.target.classList.add('active')
      removeActiveClass(users, e.target)

      serverCall(endpoints.getUserPosts + userId)
        .then(
          response => {
            const userPosts = JSON.parse(response)

            createList(userPostsList, userPosts, 'post')

            userPosts.forEach(function (post) {
              const userPost = document.querySelectorAll('.post[data-id="' + post.id + '"]')[0]
              let spinner = document.createElement('div')
              spinner.className = 'spin'
              userPost.appendChild(spinner)

              serverCall(endpoints.getPostComments + post.id)
                .then(
                  success => {
                    const serverResponse = JSON.parse(success)
                    const postsCount = serverResponse.length
                    const postItem = document.querySelectorAll('.post[data-id="' + serverResponse[0].postId + '"]')[0]

                    let badge = document.createElement('span')
                    badge.className = 'badge badge-pill badge-dark'
                    badge.innerText = postsCount
                    postItem.appendChild(badge)
                  }, error => console.log(error)
                )
            })
          },
            error => console.log(error)
        )
    } else if (e.target && e.target.className === 'list-group-item post') {
      const posts = document.getElementsByClassName('post')
      const postId = e.target.getAttribute('data-id')

      e.target.classList.add('active')
      removeActiveClass(posts, e.target)

      serverCall(endpoints.getPostComments + postId)
        .then(
          response => {
            const postComments = JSON.parse(response)

            createList(postCommentsList, postComments, 'comment')
          },
          error => console.log(error)
        )
    }
  })

  function serverCall (url) {

    return new Promise(function (resolve, reject) {
      let xhr = new XMLHttpRequest()
      xhr.open('GET', url)
      
      xhr.onload = function () {
        if (this.status === 200) {
          new Toast({
            message: 'Success!',
            type: 'success'
          })
          resolve(this.response)
        } else {
          let error = new Error(this.statusText)
          error.code = this.status
          new Toast({
            message: 'Something went wrong, try again later',
            type: 'danger'
          })
          reject(error)
        }
      }

      xhr.onerror = function () {
        reject(new Error('Network Error'))
      }

      xhr.send()
    })
  }

  function createList (elementsList, data, type) {
    let className;
    switch (type) {
      case 'user':
        className = 'list-group-item user'
        break
      case 'post':
        className = 'list-group-item post'
        break
      default:
        className = 'list-group-item comment'
        break
    }

    elementsList.innerHTML = ''
    data.forEach(function (element) {
      let listElement = document.createElement('li')
      listElement.className = className
      listElement.innerText = type === 'post' ? element.title : element.name
      listElement.setAttribute('data-id', element.id)
      elementsList.append(listElement)
    })
  }

  function removeActiveClass (elementsList, currentElement) {
    for (let i = 0; i < elementsList.length; i++) {
      if (elementsList[i] !== currentElement) {
        elementsList[i].classList.remove('active')
      }
    }
  }

})()
