var express = require('express'),
	app = express();
app.use(express.json());
app.use(express.static('public'));
app.lastUpdated = Date.now()
app.users = []

app.get('/', (req,res) => {
	res.set('Content-Type', 'text/plain');
	res.status(200).send(new Date(app.lastUpdated).toGMTString());
})

app.get('/rs', (req,res) => {
	const previous_time = app.lastUpdated;
	app.lastUpdated = Date.now();
	res.set('Content-Type', 'text/plain');
	res.status(200).send('server updated from ' + new Date(previous_time) + ' to ' + new Date(app.lastUpdated));
})

app.get('/users', (req,res) => {
	res.set('Content-Type', 'application/json');
	res.status(200).send(app.users);
})

app.get('/users/:userId', (req,res) => {
	res.set('Content-Type', 'application/json');
	res.status(200).send(app.users[req.params.userId]);
})

app.put('/users', (req,res) => {
	let data = "";
	req.on("data", chunk => {
		data += chunk;
	});
	req.on("end", () => {
		let jsondata;
		try{
			jsondata = JSON.parse(data);
			app.users.push(jsondata);
		} catch(error) {
			console.error("ERROR create user!\n" + error);
		}
	});
	res.status(102).send("Processing user");
})
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log("running at port " + PORT + " ..."));

/*
{
	"Prefname": "Mike",
	"Fullname": "Mike Holandz",
	"RegEmail": "holandz.mike@mail.com"
}
{
	"Prefname": "Moz",
	"Fullname": "Moz Linard",
	"RegEmail": "linard.moz@mail.com"
}
*/

/*
===============================================
GET /user
ERROR 401 UNAUTHORIZED
RESPONSE 302 FOUND
{
	"Prefname": "Mike",
	"Fullname": "Mike Holandz",
	"RegEmail": "holandz.mike@mail.com",
}
------------------------------------------------
//login
POST /user
BODY
{
	"RegEmail": "holandz.mike@mail.com",
	"Password": "********"
}
ERROR 409 Conflict
RESPONSE 205 Reset Content
setCookie("UserSess": "$$$$$$$$");
------------------------------------------------
//register new user
PUT /user
BODY
{
	"Prefname": "Mike",
	"Fullname": "Mike Holandz",
	"RegEmail": "holandz.mike@mail.com",
	"Password": "********"
}
ERROR 409 Conflict
RESPONSE 201 Created
setCookie("UserSess": "$$$$$$$$");
------------------------------------------------
//change user details
PATCH /user
BODY
{
	"Prefname": "Mike",
	"Fullname": "Mike Holandz",
	"RegEmail": "holandz.mike@mail.com",
	"Password": "********"
}
ERROR 409 Conflict
RESPONSE 205 Reset Content
-------------------------------------------------
//logout
DELETE /user
ERROR 401 UNAUTHORIZED
RESPONSE 205 Reset Content
clearCookies();
-------------------------------------------------
//delete account using TOPA(temporary onetime partial authority)
DELETE /user
BODY { "PartAuth" : "########", "RegEmail" : "holandz.mike@mail.com" }
ERROR 403 Forbidden
RESPONSE 205 Reset Content
clearCookies();
=================================================
GET /products
ERROR 503 Service Unavailable
RESPONSE 200 OK
{
	"..." : {Brand: Cream Bread, Price: 10.00, Stock: 20},
	"..." : {Brand: White Bread, Price: 10.00, Stock: 20},
	"..." : {Brand: Choco Bread, Price: 10.00, Stock: 20},
	"..." : {Brand: Milky Bread, Price: 10.00, Stock: 20}
}
// Response keys ( "..." ) can be CreatedAt or its derivative in crc32 form
--------------------------------------------------
// Supplier create new product
POST /products
BODY
{
	"Brand": product-brand-name,
	"Price": ...,
	"Stock": ...,
	"Description": ...,
	"Images": [url1, url2, url3]
}
ERROR 401 UNAUTHORIZED
RESPONSE 201 Created
//product-brand-name can be Cream Bread, White Bread, Choco Bread, Milky Bread
---------------------------------------------------
GET /products/:product-key
BODY
ERROR 406 Not Acceptable
RESPONSE 203 Non-Authoritative Information
{
	"Brand": product-brand-name,
	"Price": ...,
	"Stock": ...,
	"Description": ...,
	"CreatedAt": ...,
	"UpdatedAt": ...,
	"Images": [url1, url2, url3]
}
---------------------------------------------------
// Supplier change product properties
POST /products/:product-key
BODY
{
	"Brand": product-brand-name,
	"Price": ...,
	"Stock": ...,
	"Description": ...,
	"Images": [url1, url2, url3]
}
ERROR 406 Not Acceptable
ERROR 401 UNAUTHORIZED
RESPONSE 200 OK
--------------------------------------------------
// Supplier deletes a product permanently
DELETE /products/:product-key
ERROR 406 Not Acceptable
ERROR 401 UNAUTHORIZED
RESPONSE 200 OK
==================================================
// List of orders by current user or supplier
GET /orders
ERROR 503 Service Unavailable
RESPONSE 200 OK
{
	order-key : {
		"Customer" : customer-email,
		"Payment Method" : "Cash on Delivery"
		"Delivery Address" : {
			"Street" : "H67C R6A Cantonment RA",
			"District" : "Dhaka",
			"Postal Code" : 1206
		}
		"Status" : "Delivered",
		"Products" : {
			product-key : {
				"variant" : "Blue",
				"quantity" : 2,
				"price" : "3.00"
			}
			product-key : {
				"variant" : "Yellow",
				"quantity" : 1,
				"price" : "4.00"
			}
		}
		"SubTotal" : "10.00",
		"Fees and Taxes" : {
			"Shipping" : "0.75",
			"Custom Tax" : "0.25"
		}
	},
	order-key : {
		"Customer" : customer-email,
		"Payment Method" : "bKash"
		"Delivery Address" : {
			"Street" : "Ismail Mansion, Akmol Ali Road, South Halishohor, Bondor",
			"District" : "Chattogram",
			"Postal Code" : 4218
		}
		"Status" : "Pending",
		"Products" : {
			product-key : {
				"variant" : "Black",
				"quantity" : 3,
				"price" : "3.00"
			}
			product-key : {
				"variant" : "Red",
				"quantity" : 1,
				"price" : "4.00"
			}
		}
		"SubTotal" : "13.00",
		"Fees and Taxes" : {
			"Shipping" : "0.75",
			"Custom Tax" : "0.30"
		}
	}
}
--------------------------------------------------
// Create an order
POST /orders
{

}
--------------------------------------------------
// Retrieve an order
GET /orders/:order-key
ERROR 406 Not Acceptable
ERROR 401 UNAUTHORIZED
RESPONSE 200 OK
{
	"Customer" : customer-email,
	"Status" : "Delivered",
	"Products" : {
		product-key : {
			"variant" : "Blue",
			"quantity" : 2,
			"price" : "3.00"
		}
		product-key : {
			"variant" : "Yellow",
			"quantity" : 1,
			"price" : "4.00"
		}
	}
	"SubTotal" : "10.00",
	"Fees and Taxes" : {
		"Shipping" : "0.75",
		"Custom Tax" : "0.25"
	}
}
--------------------------------------------------
// Update an order
POST /orders/:order-key
{
	"Status" : "Delivered/Cancelled/Refunded"
}
ERROR 406 Not Acceptable
ERROR 401 UNAUTHORIZED
RESPONSE 200 OK
--------------------------------------------------
// Delete an order
DELETE /orders/:order-key
ERROR 406 Not Acceptable
ERROR 401 UNAUTHORIZED
RESPONSE 200 OK
==================================================
*/
