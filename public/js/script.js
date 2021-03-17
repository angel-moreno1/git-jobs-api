// globals variables
const mode = document.getElementById('switch'),
      html = document.querySelector('html'),
      jobs = document.getElementById('jobs'),
      search = document.getElementById('search'),
      loadMore = document.getElementById('load-more'),
      notJobsErrors = document.getElementById('not-jobs-error'),
      API = 'https://jobs.github.com/positions.json',
      proxy = 'https://damp-peak-01929.herokuapp.com/';
      
let isLoading = true,
    page = 1

let cached;



console.log('cached: ')
console.log(cached)

// when the user wants to search we need to delete the current jobs

const deleteCurrentJobs = _ => {
    const childrens = [...jobs.children]
    if(childrens.length > 1){
        if(childrens[0].classList.contains('job-card')){
            childrens.forEach( job => job.remove() )
        }
    }
}


// checking if there's theme and if. putting in the html element and moving the switch dot in the right position

const savedTheme = _ => {
    if(localStorage.getItem('theme-color')){

        const theme = localStorage.getItem('theme-color')

        if(theme === 'dark') {
            document.getElementById('point').classList.add('translate-x-6')
        }else {
            document.getElementById('point').classList.add('translate-x-0')
        }

        html.classList.add(theme)
        
    }
}

// toggle and saved the current theme

savedTheme()

const savedCurrentTheme = _ => {

  if(html.classList.contains('dark')){
      html.classList.replace('dark', 'light')
      localStorage.setItem('theme-color', 'light')
  }else {
      html.classList.replace('light', 'dark')
      localStorage.setItem('theme-color', 'dark')
  }

}

mode.addEventListener('change', savedCurrentTheme)

const makeSkeleton = howMany => {

    let skeleton = '';

    for (let i = 0; i < howMany; i++) {
        skeleton += `
        <section class="loading w-full h-60 bg-white dark:bg-gray-800 rounded-xl p-8 relative " ">
        <div class="w-60 h-full space-y-7 ">
          <div class=" animate-pulse w-36 h-4 rounded-full bg-gray-200"></div>
          <h2 class="w-48 h-7 animate-pulse  rounded-full bg-gray-200 mt-2"><h2>
          <div class="animate-pulse rounded-full w-28 h-4 bg-gray-200 mt-2"></div>
    
          <div class="flex items-center space-x-2 mt-2">
            <div class="text-gray-400 animate-pulse w-5 h-5 rounded-full bg-gray-200 mt-2"></div>
            <div class="text-gray-400 animate-pulse w-14 h-4   rounded-full bg-gray-200 mt-2"></div>
          </div>
          
        </div>
        </section>`
    }
    
    return skeleton
}

//  checking if data was loaded if not, put a skeleton loader instead
const skeleton = _ => {
  
    deleteCurrentJobs()

    if(isLoading){
        jobs.innerHTML = ''
        jobs.innerHTML += makeSkeleton(12)
    }else {
        document.querySelectorAll('.loading').forEach( el => el.remove() )
    }

}

// make request to the specific job (when user clicked a card) and show card page
const makeUnitRequest = async event => {
  const cardPage = document.createElement('div');
  cardPage.classList.add('card-page')
  document.body.appendChild(cardPage)

  document.querySelectorAll('.job-card').forEach( card => { card.style.display = "none" } )
  const id = event.target.parentElement.dataset.id

  try {
    const res = await fetch(`${proxy}https://jobs.github.com/positions/${id}.json`);
    const data =  await res.json();
    cardPage.innerHTML = makeSingleCardPage(data) 
  } catch (error) {
    alert(error)
  } 
}

const listeningCards = () => {
  document.querySelectorAll('.job-card').forEach( card => card.addEventListener('click', makeUnitRequest ))
}

skeleton()

//initial data  when user is in /index.html
const bringInitialData = async _ => {


  
  try {
    const res = await fetch(`${proxy}${API}`);
    const data =  await res.json()
    console.log(data)
    cached = data
    data.map(({id, company, company_logo, created_at, location, title, type}) =>  makeJob(id, company, company_logo, created_at, location, title, type))
    isLoading = false
    listeningCards()
    skeleton()
  } catch (error) {
    document.body.querySelector('main').innerHTML = "<h1>Error while try to load data <a href='index.html' class='text-blue-300'>try again</a></h1>"
  }
}

bringInitialData()

const makeJob = (id, company, company_logo, created_at, location, title, type) => {
    return  jobs.innerHTML += `
    <section class=" relative cursor-pointer w-full h-60 focus:bg-gray-200 bg-white dark:bg-gray-800 rounded-xl p-8 " data-id="${id}">
    
    <div class="w-10 h-10 absolute -top-5 rounded-xl flex items-center justify-center" >
        ${company_logo ?  `<img class=" w-10 h-10 bg-cover rounded-xl object-cover" src="${company_logo}"/>` : '<span class="h-full w-full bg-gray-300 rounded-xl"></span>' }
    </div>
    <div class="w-full h-full leading-10">
      <span class="text-gray-400"> ${formarData(created_at)} <span>&nbsp;•&nbsp;</span> ${type} </span>
      <h2 class="text-xl font-semibold dark:text-white">${title}<h2>
      <span class="text-gray-400">${company}</span>
       <div class="flex items-center space-x-2">
        <svg class="w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
</svg>
        <p class="text-blue-600 leading-5  dark:text-blue-300">${location}</p>
      </div>
    </div>
    <div class="job-card w-full h-full absolute top-0 left-0 z-40"></div>
    </section>
    `
}

//  using momets to convert date
const formarData = dt => {
    const dtar = dt.split(' ')
    const year = dtar[5]
    const month = dtar[1]
    const day = dtar[2]

    return moment(year + month + day).fromNow() 
}

const searchJobs = async _ => {
    if(notJobsErrors.innerHTML.includes('Not Jobs Found. Try Again with diferent params')){
        notJobsErrors.innerHTML = ''
    }
    
    page = 0
    isLoading = true
    
    const title = document.getElementById('title').value
    const location = document.getElementById('filter-location').value
    const type = document.querySelector('select').value

    if(title || location){
        skeleton()

        const res = await fetch(`
        ${proxy}${API}?description=${title}&${type}=true&location=${location}
        `);
        const data =  await res.json()

        if(data.length == 0){
            notJobsErrors.innerHTML = 'Not Jobs Found. Try Again with diferent params' 
        }else {
            data.map(({id, company, company_logo, created_at, location, title, type}) => makeJob(id, company, company_logo, created_at, location, title, type))
        }

        isLoading = false
        listeningCards()
        skeleton()
    }else {
        // show alert if there are not value in the inputs
        const alert = document.getElementById('alert')
        alert.style.transform = "translate(0px)"

        const setId = setTimeout( _ => {
            alert.style.transform = "translate(200px)"
            clearTimeout(setId)
        }, 1500)
    }

}

const bringMoreData = async _ => {

    loadMore.innerHTML = '<button class="py-4 px-3 bg-indigo-500 text-white rounded-xl dark:bg-gray-800 outline-none mb-5">Loading...</button>'
    const res = await fetch(`${proxy}${API}?page=${page++}`);
    const data =  await res.json()
    data.map( ({id, company, company_logo, created_at, location, title, type}) => makeJob(id, company, company_logo, created_at, location, title, type))
    loadMore.innerHTML = '<button class="py-4 px-3 bg-indigo-500 text-white rounded-xl outline-none dark:bg-gray-800 mb-5">Load More</button>'
    listeningCards()
}


// listening navigation buttons reset page and reset loading to true
search.addEventListener('click', searchJobs)

// when clicked button "load more" bring more jobs 
loadMore.addEventListener('click', bringMoreData)

const makeSingleCardPage = ({company, company_logo, company_url, url, description, title, created_at, how_to_apply, location, type}) => {
    return ( 
    `<div class="h-auto bg-gray-100 h-full">
    <nav class="w-full h-24 bg-indigo-600 px-6 dark:bg-gray-900 z-10">
      <div class="w-full h-16 flex items-center justify-between md:w-9/12 md:mx-auto">
        <a href="./index.html">
          <h1 class="text-2xl text-white font-bold">DevJobs</h1>
        </a>
        <span class="sr-only"> SWITCH </span>
  
        <div class="w-32 h-full flex items-center justify-between">
          <div class="w-5 h-5">
            <svg class="text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <input type="checkbox" class="hidden" id="switch" />
          <label for="switch" class="rounded-full">
            <div class="w-12 h-5 rounded-full px-1 bg-white flex items-center cursor-pointer">
              <div id="point" class="w-4 h-4 rounded-full bg-indigo-600 dark:bg-gray-900 transform transition-transform duration-300 ease-out"></div>
            </div>
          </label>
  
          <div class="w-5 h-5">
            <svg class="text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </div>
        </div>
      </div>
    </nav>
  
    <div class="w-screen h-auto absolute top-16">
      <section class="w-1/2 bg-white dark:bg-gray-700 h-32 mx-auto rounded-lg flex justify-center p-6">
        <div class="h-full w-1/6 lg:flex lg:items-center lg:justify-center hidden">
          <img class="w-full py-6 pr-7 h-32" src="${company_logo}" />
        </div>
        <div class="w-3/6 flex items-center pl-8 justify-center lg:justify-start">
          <div>
            <h2 class="text-2xl font-semibold block dark:text-white">${company}</h2>
            <p class="text-gray-400">${company_url ? company_url : company }</p>
          </div>
        </div>
        <div class="h-full w-2/6 lg:items-center  hidden lg:flex  justify-end">
          <a href="${company_url ? company_url : url}" target="_blank"  class=" bg-indigo-100 px-3 py-4 rounded-md text-indigo-600 font-medium">${company_url ? "Company Site" : "See More"}</a>
        </div>
      </section>
  
      <article class="w-1/2 mx-auto h-auto mt-4 dark:bg-gray-700 dark:text-white rounded-lg bg-white p-7">
      
      
    <div class="w-full flex justify-between mb-9">
    <div>
      <span  class="text-gray-600"> ${formarData(created_at)} <span>&nbsp;•&nbsp;</span> ${type}</span>
      <h2 class="text-3xl text-gray-800 font-bold">${title}</h2>
      <span class="text-blue-800">${location}</span>
    </div>
    <div class="flex items-center">
      <a href="#desc" class="bg-blue-600 text-white py-2 px-6 rounded">Apply Now</a>
    </div>
  </div>



      <div class="desc" id="desc">${description}</div>
      ${how_to_apply}
      </article>
    </div>
  </div>`

    )
}
