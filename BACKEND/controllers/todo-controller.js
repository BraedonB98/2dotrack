//-------------------APIAuth-----------------------------
const APIKEYS = require('../apikeys');

//--------------------imports-------------------------
const mongoose = require('mongoose');
const client = require('twilio')(APIKEYS.TWILIOSID, APIKEYS.TWILIOAUTHTOKEN);
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(APIKEYS.SENDGRIDAPIKEY);

//------------------Modules--------------------------
const userController = require('../controllers/user-controller');
const getUserById = userController.getUserById;
const getUserByProps = userController.getUserByProps;
//------------------Models------------------------------
const HttpError = require('../models/http-error');
const User = require('../models/user-model');
const ToDoItem = require('../models/toDoItem-model');

//-----------------------HelperFunctions-----------------------
const getItemById = async(TID) =>{
    let item
    try{
        item = await ToDoItem.findById(TID);
    }
    catch(error){
        return({error:error,errorMessage:'Could not access task in database',errorCode:500})
    };
    if(!item){
        return({error:error,errorMessage:'Task not in database',errorCode:404})
    }
    return(item);
}

//-----------------------Controllers------------------
const createItem = async(req,res,next)=>{ //dont need to check for duplicates because they are ok
    const{cid, uid, name, recurring, status,due,priority,address,location,notes}= req.body;//creator and users[0]= uid

    //Find User
    let user = await getUserById(uid); 
    if(!!user.error){return(next(new HttpError(user.error.message, user.error.code)))}
    let category = user.toDoCategories.filter(category => category.name === cid)[0]
    console.log(!category);
    if (!category)
    {
        return(next(new HttpError("Category not found", 422)))
    }
    
    //Create Item
    const newItem = new ToDoItem({
        name,
        recurring,
        status,
        due,
        priority,
        address,
        location,
        notes,
        creator:uid,
        users:[uid]
    });

    
    //Save user and todo with sessions like in new place
    try{
        
        console.log("starting session")
        const sess = await mongoose.startSession();
        sess.startTransaction();//transactions perform multiple action
        
        await newItem.save({session:sess})
        category.toDoList.push(newItem);
        user.toDoCategories.filter(category => category.name === cid)

        //user.toDoCategories.filter(category => category.name === cid)[toDoList].push(newItem);
        await user.save({session:sess});
        

        await sess.commitTransaction();//saves transaction if all successful 
    }
    catch(error){
        console.log(error)
        return(next(new HttpError('Could not update user or item in database', 500)));
    }
        

    res.status(201).json({task: newItem.toObject({getters:true})})
}

const editItem = async(req,res,next)=>{
            const tid = req.params.TDIID;
            const {name,status,priority,address,notes}= req.body;
    
            let item = await getItemById(tid);
            if(!!item.error){return(next(new HttpError(item.error.message, item.error.code)))}
    
            if(name){item.name = name};
            if(status){item.status = status};
            if(status){item.priority = priority};
            if(status){item.address = address};//update location at the same time
            if(status){item.notes = notes};

            
            try{
                await item.save();
            }
            catch(error){
                console.log(error);
                return(next(new HttpError('Could not update task in database', 500)));
            }
                
        
                
            res.status(200).json({preferences: item.toObject({getters:true})});
}

const deleteItem = async(req,res,next)=>{
    res.status(201).json({message:"test"}.toObject({getters:true}))
}

const getItem = async(req,res,next)=>{
    const tid = req.params.TDIID;
    //getting item from DB
    let item = await getItemById(tid);
    if(!!item.error){return(next(new HttpError(item.errorMessage, item.errorCode)))}
 

    res.status(200).json({task: item.toObject({getters:true})});

}

const getItems= async(req,res,next)=>{
    res.status(201).json({message:"test"}.toObject({getters:true}))
}

const moveItem = async(req,res,next)=>{
    res.status(201).json({message:"test"}.toObject({getters:true}))
}
const shareItem = async(req,res,next)=>{
    res.status(201).json({message:"test"}.toObject({getters:true}))
}
const acceptPendingSharedItem = async(req,res,next)=>{
    res.status(201).json({message:"test"}.toObject({getters:true}))
}
const getPendingSharedItems = async(req,res,next)=>{
    res.status(201).json({message:"test"}.toObject({getters:true}))
}
const transferCreator = async(req,res,next)=>{
    res.status(201).json({message:"test"}.toObject({getters:true}))
}
const createCategory = async(req,res,next)=>{
    const{uid, name, icon}= req.body;

    //Find User
    let user = await getUserById(uid); 
    if(!!user.error){return(next(new HttpError(user.error.message, user.error.code)))}
  
    if (user.toDoCategories.filter(category => category.name === name).length!==0)
    {
        return(next(new HttpError("Category name already exists", 422)))
    }
    
    const category = {
        name,
        icon,
        toDoList:[]
    }
    user.toDoCategories.push(category);

    try{
        await user.save();
    }
    catch(error){
        console.log(error);
        return(next(new HttpError('Could not update user in database', 500)));
    }
        

    res.status(201).json({category: user.toDoCategories.toObject({getters:true})})
}

const renameCategory = async(req,res,next)=>{
    const{uid, name , newName}= req.body;

    //Find User
    let user = await getUserById(uid); 
    if(!!user.error){return(next(new HttpError(user.error.message, user.error.code)))}
   
    if (user.toDoCategories.filter(category => category.name === name).length!==0)
    {
        user.toDoCategories.find(category => category.name === name).name = newName;
    }
    else{
        return(next(new HttpError("Category not found in database", 404)))
    }
    

    try{
        await user.save();
    }
    catch(error){
        console.log(error);
        return(next(new HttpError('Could not update user in database', 500)));
    }
        

    res.status(201).json({category: user.toDoCategories.toObject({getters:true})})
}
const deleteCategory = async(req,res,next)=>{    
    res.status(201).json({message:"test"}.toObject({getters:true}))
}
const getCategory = async(req,res,next)=>{
    const {cid,uid} = req.params;
    //Find User
    let user = await getUserById(uid); 
    if(!!user.error){return(next(new HttpError(user.error.message, user.error.code)))}
    let category = user.toDoCategories.filter(category => category.name === cid)
    if (category.length===0)
    {
        return(next(new HttpError("Category Cant Be Located", 422)))
    }
    res.status(200).json({category: category})
}


//---------------------Exports--------------------------
exports.createItem = createItem;//yes I realize this could be called task but im commited now
exports.editItem = editItem;
exports.deleteItem = deleteItem;
exports.getItem = getItem;
exports.getItems = getItems;

exports.moveItem = moveItem;

exports.shareItem = shareItem;
exports.acceptPendingSharedItem = acceptPendingSharedItem;
exports.getPendingSharedItems =getPendingSharedItems;
exports.transferCreator = transferCreator;

exports.createCategory = createCategory;
exports.renameCategory = renameCategory;
exports.deleteCategory = deleteCategory;
exports.getCategory = getCategory;
