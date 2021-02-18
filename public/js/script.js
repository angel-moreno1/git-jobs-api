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
        if(theme == 'dark') {
            document.getElementById('point').classList.add('translate-x-6')
        }else {
            document.getElementById('point').classList.add('translate-x-0')
        }
        html.classList.add(theme)
    }
}

// toggle and saved the current theme

savedTheme()
mode.onchange = _ => {
    if(html.classList.contains('dark')){
        html.classList.replace('dark', 'light')
        localStorage.setItem('theme-color', 'light')
    }else {
        html.classList.replace('light', 'dark')
        localStorage.setItem('theme-color', 'dark')
    }
}


const makeSkeleton = how_many => {

    let skeleton = '';
    for (let i = 0; i <how_many; i++) {
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

skeleton()

//initial data  when user is in /index.html
const bringInitialData = async _ => {
    const res = await fetch(`${proxy}${API}`);
    const data =  await res.json()
    data.map(({id, company, company_logo, created_at, location, title, type}) =>  makeJob(id, company, company_logo, created_at, location, title, type))
    isLoading = false
 
    skeleton()
}

bringInitialData()

const makeJob = (id, company, company_logo, created_at, location, title, type) => {
    return  jobs.innerHTML += `
    <section onclick="makeRequest()" class="job-card relative cursor-pointer w-full h-60 focus:bg-gray-200 bg-white dark:bg-gray-800 rounded-xl p-8 " data-id="${id}">
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
    if(!title == '' || !location == '' ){
        skeleton()

        const res = await fetch(`
        ${proxy}${API}?description=${title}&${type}=true&location=${location}
        `);
        const data =  await res.json()
        if(data.length == 0){
            // TODO make a beautiful layout when not jobs found
            notJobsErrors.innerHTML = 'Not Jobs Found. Try Again with diferent params' 
        }else {
            data.map(({id, company, company_logo, created_at, location, title, type}) => makeJob(id, company, company_logo, created_at, location, title, type))
        }
        isLoading = false
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
}


// listening navigation buttons reset page and reset loading to true
search.addEventListener('click', searchJobs)

// when clicked button "load more" bring more jobs 
loadMore.addEventListener('click', bringMoreData)


// make request to the specific job (when user clicked a card)
const makeRequest = async _ => {
    const res = await fetch(`${proxy}https://jobs.github.com/positions/507628b3-95ce-431b-a531-4efef56b67e6.json`);
    const data =  await res.json()
    console.log(data)
}


//TODO unit page for job 
