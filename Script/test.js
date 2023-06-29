async function get_db_from_name(db_name) {
    const response = await fetch(`./data/${db_name}.json`)
    const jsonData = await response.json()
    return jsonData
}

async function get_users_from_role(role_name) {
    /* 
    pre: role_name is the name of a role (trialhelper, helper, guardian, etc)
    post: returns a list of names, unix value and current value
    
    Example:
    "guardian" returns [ {name: Lisa, time: 1598006832, current: guardianmanagerhelper}, ...]
    "invalidrolename" returns []
    */
    let list = []

    // Find which db to look into
    let role_db = await get_db_from_name("Role")
    let role_data = role_db.find((elmt) => elmt.name == role_name)
    if (!role_data) { return [] } // invalid name, no data
    let role_category = role_data.category

    // Get the role data
    let data = await get_db_from_name(role_category)
    data.forEach(elmt => {

        // Did this person ever get the role?
        if (elmt[role_name] != null) {
            // Yes, add to list

            if (typeof(elmt[role_name]) == "string") {
                // only keep first occurence
                new_time = parseInt(elmt[role_name].split(" ")[0])
            } else {
                new_time = elmt[role_name]
            }

            list.push({
                name: elmt.name,
                time: new_time,
                current: elmt.current,
                languages: elmt.languages
            })
        }
    })

    return list
}

function filter_by_language(member_list,language) {
    return member_list.filter(member => member.languages.includes(language));
}

function unix_to_date(timestamp) {
    // pre: timestamp is a unix timestamp from the database
    // post: returns "dd month yyyy"
    // example: 0 -> "01 January 1900"
    let date = new Date(list_to_add[i]*1000); // from unix to object
    
    day = date.getDate()
    if (day<10) {
        day = "0" + day
    }

    let months = ["January","February","March","April","May","June","July","August","September","October","November","December"]
    month = months[date.getMonth()] // going from number to string

    year = temp_time.getYear() + 1900

    result = day + " " + month + " " + year
    return result
}

async function loading() {
    // get url parameters
    let page_url = new URLSearchParams(window.location.search);
    let member_name = page_url.get('member');
    let role_name = page_url.get('role')
    let language_parameter = page_url.get('language');
    let sort_type = page_url.get('sort');

    if (language_parameter) { // making it case insensitive
        language_parameter = language_parameter.substring(0,1).toUpperCase() + page_url.get('language').substring(1).toLowerCase()
    }

    if (member_name && role_name) {
        // if both are set, member has priority over role, to avoid conflicts
        role_name = null
    }

    if (role_name) {
        // load role info
        document.title = "Role info"
        let users_data = await get_users_from_role(role_name)

        // filter accordingly
        if (language_parameter) {
            users_data = filter_by_language(users_data,language_parameter)
        }

        // sort accordingly
        if (sort_type == "language") {
            users_data.sort((a,b) => a.languages.localeCompare(b.languages))
        } else if (sort_type == "name") {
            users_data.sort((a,b) => a.name.localeCompare(b.name))
        } else { 
            // default = sort by date
            users_data.sort((a,b) => a.time - b.time)
        }
        console.log(users_data)
    }
}