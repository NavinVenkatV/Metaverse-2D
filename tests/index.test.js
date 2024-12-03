import axios from 'axios'

const BACKEND_URL = "http://localhost:3000"
const WS_URL = "ws://localhost:3001"

//test for HTTP server

describe("authorization" , ()=>{

  test("User to sign up only once", async()=>{
    const username = "Navin Venkat"+ Math.random();
    const password = "1232123"
    const res = await axios.post(`${BACKEND_URL}/api/v1/user/signup`,{
      username,
      password,
      type : "admin"
    })

    expect(res.statusCode.toBe(200))

    const anotherres = await axios.post(`${DATABASE_URL}/api/v1/user/signup`,{
      username,
      password,
      type : "admin"
    })
    expect(anotherres.statusCode.toBe(400))

  })

  test("If User's username is empty" , async()=>{
    const username = `Navin-${Math.random()}`
    const password = "1232321";
    const res = await axios.post(`${BACKEND_URL}/api/v1/user/signup`,{
      password,
      type : "admin"
    })

    expect(res.statusCode.toBe(400))
  })

  test("User to sign in and returns token" , async()=>{
    const username = `Navin-${Math.random()}`;
    const password = "123232";

    axios.post(`${BACKEND_URL}/api/v1/user/signin`,{
      username,
      password
    })

    const res = axios.post(`${DATABASE_URL}/api/v1/user/signin`,{
      username,
      password
    })

    expect(res.statusCode.toBe(200))
    expect(res.body.token).tobedefined()
  })

  test("If User's username and password is incorrect", async()=>{
    const username = `Navin-${Math.random()}`;
    const password = "12323123";
    const res = await axios.post(`${BACKEND_URL}/api/v1/user/signin`,{
      username,
      password
  })

    expect(res.statusCode.toBe(403)) // common status code for unauthorized === 403

  })

})

describe("user metadata information" , ()=>{ 
  
  const token = "";
  const avatarId = ""

  beforeAll(async ()=>{
    const username = `Navin-${Math.random()}`;
    const password = "12323123";

    await axios.post(`${BACKEND_URL}/api/v1/user/signup`,{
      username,
      password,
      type : "admin"
    })

    const res = await axios.post(`${BACKEND_URL}/api/v1/user/signin`,{
      username,
      password
    })

    token = res.data.token  //authentication

    const avatarResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`, {
      "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
      "name": "Timmy"
    }) 

    avatarId = avatarResponse.data.avatarId

  })
  
  test("If User's given avatar_id is not valid to update meatadata", async()=>{
    const avatarId = "12312";
    const res = await axios.post(`${BACKEND_URL}/api/v1/user/metadata`,{
      avatarId
    },{
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
    expect(res.statusCode.toBe(400))
  })

  test("If User's given avatar_id is valid to update metadata", async()=>{
    const avatarId = "12312";
    const res = await axios.post(`${BACKEND_URL}/api/v1/user/metadata`,{
      avatarId
    },{
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
    expect(res.statusCode.toBe(200))
  })

  test("If User forget to send auth header to update metadata", async()=>{
    const avatarId = "12312";
    const res = await axios.post(`${BACKEND_URL}/api/v1/user/metadata`,{
      avatarId
    })
    expect(res.statusCode.toBe(403))
  })

})

describe("User avatar information", ()=>{
  let avatarId = "";
  let token  = "";
  let userId;

  beforeAll(async ()=>{
    const username = `Navin-${Math.random()}`;
    const password = "12323123";

    const signupResponse = await axios.post(`${BACKEND_URL}/api/v1/user/signup`,{
      username,
      password,
      type : "admin"
    })

    userId = signupResponse.data.userId

    const res = await axios.post(`${BACKEND_URL}/api/v1/user/signin`,{
      username,
      password
    })

    token = res.data.token

    const avatarResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`, {
      "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
      "name": "Timmy"
    },{
      headers : {
        Authorization : `Bearer ${adminToken}`
      }
    }) 

    avatarId = avatarResponse.data.avatarId

  })

   test("get back avatar information from user", async ()=>{

    const res = await axios.post(`${BACKEND_URL}/api/v1/user/metadata/bulk?ids=[${userId}]`);
    expect(res.data.avatars.length.toBe(1));
    expect(res.data.avatars[0].userId.toBe(userId))

   })

   test("get all the available avatar ", async ()=>{

    const res = await axios.post(`${BACKEND_URL}/api/v1/avatars`);
    expect(res.data.avatars.not.toBe(0))
    const currentAvatar = res.data.avatars.find(x => x.id === avatarId)
    expect(currentAvatar).tobedefined()

   })

})

describe("Space information", ()=>{
  let adminToken;
  let adminId;
  let userToken;
  let userId;
  let element1Id;
  let element2Id;
  let mapId;

  beforeAll( async ()=>{
    const username = `Navin-${Math.random()}`;
    const password = "12323123";

    const signupResponse = await axios.post(`${BACKEND_URL}/api/v1/user/signup`,{
      username,
      password,
      type : "admin"
    })

    adminId = signupResponse.data.userId  //something to be changed here

    const res = await axios.post(`${BACKEND_URL}/api/v1/user/signin`,{
      username,
      password
    })

    adminToken = res.data.token

    const usersignupRes = await axios.post(`${BACKEND_URL}/api/v1/user/signup`,{
      username: username + "-user",
      password,
      type : "user"
    })

    userId = usersignupRes.data.userId  //something to be changed here

    const usersigninRes = await axios.post(`${BACKEND_URL}/api/v1/user/signin`,{
      username : username + "-user",
      password
    })

    userToken = usersigninRes.data.token

    const element1 = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
      "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
      "width": 1,
      "height": 1,
      "static": true
    },{
      headers : {
        Authorization : `Bearer ${token}`
      }
    })
    element1Id = element1.data.id;

    const element2 = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
      "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
      "width": 1,
      "height": 1,
      "static": true
    },{
      headers : {
        Authorization : `Bearer ${token}`
      }
    })
    element2Id = element2.data.id;

    const map = await axios.post(`${BACKEND_URL}/api/v1/admin/map`, {
      "thumbnail": "https://thumbnail.com/a.png",
      "dimensions": "100x200",
      "name": "100 person interview room",
      "defaultElements": [{
        elementId: element1Id,
        x: 20,
        y: 20
      }, {
        elementId: element1Id,
        x: 18,
        y: 20
      }, {
        elementId: element2Id,
        x: 19,
        y: 20
      }, {
        elementId: element2Id,
        x: 19,
        y: 20
      }
      ]
   },{
    headers :{
      Authorization : `Bearer ${adminToken}`
    }
   }) 

   mapId = map.data.id

  })

  test("user creating a space", async()=>{
    const res = await axios.post(`${BACKEND_URL}/api/v1/space`,{
      "name": "Test",
      "dimensions": "100x200",
      "mapId": mapId
    },{
      headers : {
        Authorization : `Bearer ${userToken}`
      }
    })

    expect(res.data.spaceId).tobedefined()
  })

  test("user creating a space without mapId (empty Space)", async()=>{
    const res = await axios.post(`${BACKEND_URL}/api/v1/space`,{
      "name": "Test",
      "dimensions": "100x200",
    },{
      headers : {
        Authorization : `Bearer ${userToken}`
      }
    })

    expect(res.data.spaceId).tobedefined()
  })

  test("user cannot create a space without mapId and the dimentions", async()=>{
    const res = await axios.post(`${BACKEND_URL}/api/v1/space`,{
      "name": "Test",
    },{
      headers : {
        Authorization : `Bearer ${userToken}`
      }
    })

    expect(res.statusCode).toBe(400); 
  })

  test("user cannot delete a space that doesnt exists", async()=>{
    const res = await axios.delete(`${BACKEND_URL}/api/v1/space/randomSpaceId`)

    expect(res.statusCode).toBe(400)
  },{
    headers : {
      Authorization : `Bearer ${userToken}`
    }
  })

  test("user can delete a space that doesnt exists", async()=>{
    const res = await axios.post(`${BACKEND_URL}/api/v1/space`,{
      "name": "Test",
      "dimensions": "100x200",
      "mapId": mapId
    },{
      headers : {
        Authorization : `Bearer ${userToken}`
      }
    })

    const delRes = await axios.delete(`${BACKEND_URL}/api/v1/space/${res.data.spaceId}`,{
      headers : {
        Authorization : `Bearer ${userToken}`
      }
    })

    expect(delRes.statusCode).toBe(200)
  })

  test("user cannot delete the space which was created by another user", async()=>{
    const res = await axios.post(`${BACKEND_URL}/api/v1/space`,{
      "name": "Test",
      "dimensions": "100x200",
      "mapId": mapId
    },{
      headers : {
        Authorization : `Bearer ${userToken}`
      }
    })

    const delRes = await axios.delete(`${BACKEND_URL}/api/v1/space/${res.data.spaceId}`,{
      headers : {
        Authorization : `Bearer ${adminToken}`
      }
    })

    expect(delRes.statusCode).toBe(400)
  })

  test("admin has no spaces initially", async()=>{
    const res =await axios.get(`${BACKEND_URL}/api/v1/space/all`)
    expect(res.data.spaces.length).toBe(0);
  })

  test("admin has no space initially", async()=>{
    const spaceCreate = await axios.post(`${BACKEND_URL}/api/v1/space/all`,{
      "name": "Test",
      "dimensions": "100x200",
    },{
      headers : {
        Authorization : `Bearer ${userToken}`
      }
    })
    const res = await axios.get(`${BACKEND_URL}/api/v1/space/all`,{
      headers : {
        Authorization : `Bearer ${userToken}`
      }
    });
    const filteredSpace = res.spaces.find(x => x.id === spaceCreate.spaceId)
    expect(res.data.spaces.length).toBe(1);
    expect(filteredSpace).tobedefined();

  })

})

describe("Arena endpoints",()=>{
  let adminToken;
  let adminId;
  let userToken;
  let userId;
  let element1Id;
  let element2Id;
  let mapId;
  let spaceId ;

  beforeAll( async ()=>{
    const username = `Navin-${Math.random()}`;
    const password = "12323123";

    const signupResponse = await axios.post(`${BACKEND_URL}/api/v1/user/signup`,{
      username,
      password,
      type : "admin"
    })

    adminId = signupResponse.data.userId  //something to be changed here

    const res = await axios.post(`${BACKEND_URL}/api/v1/user/signin`,{
      username,
      password
    })

    adminToken = res.data.token

    const usersignupRes = await axios.post(`${BACKEND_URL}/api/v1/user/signup`,{
      username : username + "-user",
      password,
      type : "user"
    })

    userId = usersignupRes.data.userId  //something to be changed here

    const usersigninRes = await axios.post(`${BACKEND_URL}/api/v1/user/signin`,{
      username : username + "-user",
      password
    })

    userToken = usersigninRes.data.token

    const element1 = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
      "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
      "width": 1,
      "height": 1,
      "static": true
    },{
      headers : {
        Authorization : `Bearer ${adminToken}`
      }
    })
    element1Id = element1.data.id;

    const element2 = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
      "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
      "width": 1,
      "height": 1,
      "static": true
    },{
      headers : {
        Authorization : `Bearer ${adminToken}`
      }
    })
    element2Id = element2.data.id;

    const mapRes = await axios.post(`${BACKEND_URL}/api/v1/admin/map`, {
      "thumbnail": "https://thumbnail.com/a.png",
      "dimensions": "100x200",
      "name": "100 person interview room",
      "defaultElements": [{
        elementId: element1Id,
        x: 20,
        y: 20
      }, {
        elementId: element1Id,
        x: 18,
        y: 20
      }, {
        elementId: element2Id,
        x: 19,
        y: 20
      }]
   },{
    headers :{
      Authorization : `Bearer ${adminToken}`
    }
   }) 

   mapId = mapRes.data.id

    const spaceRes = await axios.post(`${BACKEND_URL}/api/v1/space`, {
      "name": "Test",
      "dimensions": "100x200",
      "mapId": mapId
    },{
      headers :{
        Authorization : `Bearer ${userToken}`
      }
     })

    spaceId = spaceRes.spaceId;

  })
  
  test("Incorrect spaceId entered gives 400", async()=>{
   const res = await axios.get(`${BACKEND_URL}/api/v1/space/invalid_spaceId`,{
    headers : {
      Authorization : `Bearer ${userToken}`
    }
   })
   expect(res.statusCode).toBe(400)
  })

  test("correct spaceId entered returns all the element", async()=>{
    const res = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`,{
      headers : {
        Authorization : `Bearer ${userToken}`
      }
     })
    expect(res.data.dimensions).toBe("100x200");
    expect(res.data.elements.length).toBe(3)
   })

  test("Delete endpoint is able to delete the element", async()=>{
    const res = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`,{
      headers : {
        Authorization : `Bearer ${userToken}`
      }
     });
    await axios.delete(`${BACKEND_URL}/api/v1/space/element`,{
      spaceId,
      element : res.data.elements[0].id
    })

    const newRes = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`); 

    expect(newRes.data.elements.length).toBe(2);
  })
  
  test("adding element fails if the dimension of the element is wrong", async()=>{
    await axios.post(`${BACKEND_URL}/api/v1/space/element`, {
      "elementId": element1Id,
      "spaceId": spaceId,
      "x": 1000,
      "y": 20000
    },{
      headers : {
        Authorization : `Bearer ${userToken}`
      }
     })

    expect(newRes.statusCode).toBe(400)

  })

  test("adding element to the space", async()=>{
    await axios.post(`${BACKEND_URL}/api/v1/space/element`, {
      "elementId": element1Id,
      "spaceId": spaceId,
      "x": 50,
      "y": 20
    },{
      headers : {
        Authorization : `Bearer ${userToken}`
      }
     })

    const newRes = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`)

    expect(newRes.data.elements.length).toBe(3)
    
  })

 
  
})

describe("Admin endpoints", async ()=>{
  let adminToken;
  let adminId;
  let userToken;
  let userId;

  beforeAll( async ()=>{
    const username = `Navin-${Math.random()}`;
    const password = "12323123";

    const signupResponse = await axios.post(`${BACKEND_URL}/api/v1/user/signup`,{
      username,
      password,
      type : "admin"
    })

    adminId = signupResponse.data.userId  //something to be changed here

    const res = await axios.post(`${BACKEND_URL}/api/v1/user/signin`,{
      username,
      password
    })

    adminToken = res.data.token

    const usersignupRes = await axios.post(`${BACKEND_URL}/api/v1/user/signup`,{
      username : username + "-user",
      password,
      type : "user"
    })

    userId = usersignupRes.data.userId  //something to be changed here

    const usersigninRes = await axios.post(`${BACKEND_URL}/api/v1/user/signin`,{
      username : username + "-user",
      password
    })

    userToken = usersigninRes.data.token


  })

  test("user is unable to hit the admin endpoint", async()=>{
    const elementRes = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
      "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
      "width": 1,
      "height": 1,
      "static": true
    },{
      headers : {
        Authorization : `Bearer ${userToken}`
      }
    })

    const mapRes = await axios.post(`${BACKEND_URL}/api/v1/admin/map`, {
      "thumbnail": "https://thumbnail.com/a.png",
      "dimensions": "100x200",
      "name": "100 person interview room",
      "defaultElements": []
   },{
    headers :{
      Authorization : `Bearer ${userToken}`
    }
   }) 
   
   const avatarResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`, {
    "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
    "name": "Timmy"
  },{
    headers :{
      Authorization : `Bearer ${userToken}`
    }
   }) 

    const updateELementRes = await axios.put(`${BACKEND_URL}/api/v1/admin/element/21`, {
      "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
    }, {
      headers: {
        Authorization: `Bearer ${userToken}`
      }
    })

   expect(avatarResponse.statusCode).toBe(403)
   expect(elementRes.statusCode).toBe(403)
   expect(mapRes.statusCode).toBe(403);
   expect(updateELementRes.statusCode).toBe(403);
  })

  test("admin is able to hit the admin endpoint", async()=>{
    const elementRes = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
      "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
      "width": 1,
      "height": 1,
      "static": true
    },{
      headers : {
        Authorization : `Bearer ${adminToken}`
      }
    })

    const mapRes = await axios.post(`${BACKEND_URL}/api/v1/admin/map`, {
      "thumbnail": "https://thumbnail.com/a.png",
      "dimensions": "100x200",
      "name": "100 person interview room",
      "defaultElements": []
   },{
    headers :{
      Authorization : `Bearer ${adminToken}`
    }
   }) 
   
   const avatarResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`, {
    "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
    "name": "Timmy"
  },{
    headers :{
      Authorization : `Bearer ${adminToken}`
    }
   })

   expect(avatarResponse.statusCode).toBe(200)
   expect(elementRes.statusCode).toBe(200)
   expect(mapRes.statusCode).toBe(200);
  })

  test("admin is able to update a image url of the element", async()=>{
    const elementRes = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
      "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
      "width": 1,
      "height": 1,
      "static": true
    },{
      headers : {
        Authorization : `Bearer ${adminToken}`
      }
    })

    const updateELementRes = await axios.put(`${BACKEND_URL}/api/v1/admin/element/${elementRes.data.id}`,{
      "imageUrl" : "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE"
    },{
      headers : {
        Authorization : `Bearer ${adminToken}`
      }
    })

    expect(updateELementRes.statusCode).toBe(200);
    
  })

})

//WebSocket test

describe("WebSocket tests", async()=>{
  let userId;
  let adminId;
  let userToken;
  let adminToken;
  let element1Id;
  let element2Id;
  let mapId;
  let spaceId ;
  let ws1;
  let ws2;
  let ws1Messages = [];
  let ws2Messages = [];

  function waitforandpoplatestMessages(messageArr){
    return new Promise(resolve=>{
      if(messageArr.length > 0){
        resolve(messageArr.shift())
      }else{
        let interval = setInterval(()=>{
          if(messageArr.length > 0){
            resolve(messageArr.shift())
            clearInterval(interval)
          }
        },100)
      }
    })
  }

  async function setupHTTP(){
      const username  = `Navin${Math.random()}`
    const password = "q2123"
    const userSigninRes = await axios.post(`${BACKEND_URL}/api/v1/user/signin`,{
      username,
      password,
      role : "user"
    })

    const userSignupRes = await axios.post(`${BACKEND_URL}/api/v1/user/signup`,{
      username,
      password
    })
    userId = userSigninRes.data.id;
    userToken = userSignupRes.data.token;

    const adminSigninRes = await axios.post(`${BACKEND_URL}/api/v1/admin/signin`,{
      username : username + '-admin',
      password,
      role : "admin"
    })

    const adminSignupRes = await axios.post(`${BACKEND_URL}/api/v1/admin/signup`,{
      username : username + "-admin",
      password
    })
    adminId = adminSigninRes.data.id;
    adminToken = adminSigninRes.data.token;

    const element1 = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
      "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
      "width": 1,
      "height": 1,
      "static": true
    },{
      headers : {
        Authorization : `Bearer ${adminToken}`
      }
    })

    const element2 = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
      "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
      "width": 1,
      "height": 1,
      "static": true
    },{
      headers : {
        Authorization : `Bearer ${adminToken}`
      }
    })
    element1Id = element1.data.id;
    element2Id = element2.data.id;

    const mapRes = await axios.post(`${BACKEND_URL}/api/v1/admin/map`, {
      "thumbnail": "https://thumbnail.com/a.png",
      "dimensions": "100x200",
      "name": "100 person interview room",
      "defaultElements": [{
        elementId: element1Id,
        x: 20,
        y: 20
      }, {
        elementId: element1Id,
        x: 18,
        y: 20
      }, {
        elementId: element2Id,
        x: 19,
        y: 20
      }]
   },{
    headers :{
      Authorization : `Bearer ${adminToken}`
    }
   }) 

    const spaceRes = await axios.post(`${BACKEND_URL}/api/v1/space`, {
      "name": "Test",
      "dimensions": "100x200",
      "mapId": mapId
    },{
      headers :{
        Authorization : `Bearer ${userToken}`
      }
     })

    mapId = mapRes.data.id
    spaceId = spaceRes.data.spaceId;
    
  }

  async function setupws(){

    ws1 = new WebSocket(WS_URL);
    ws2 = new WebSocket(WS_URL);

    await new Promise(r=>{
      ws1.onopen = r;
    })

    await new Promise(r =>{
      ws2.onopen = r
    })

    ws1.onmessage((event)=>{
      ws1Messages.push(JSON.parse(event));
    })

    ws2.onmessage((event)=>{
      ws2Messages.push(JSON.parse(event))
    })

  }

  beforeAll(async()=>{

    setupHTTP();
    setupws();

  })

  test("get back ack after joining the space", ()=>{
    ws1.send(JSON.stringify({
      "type": "join",
      "payload": {
        "spaceId": spaceId,
        "token": adminToken
      }
    }))
  
    ws2.send(JSON.stringify({
      "type": "join",
      "payload": {
        "spaceId": spaceId,
        "token": userToken
      }
    }))
  })

})


