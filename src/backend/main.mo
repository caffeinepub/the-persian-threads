import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import Text "mo:core/Text";



actor {
  type Category = {
    #Women;
    #Men;
    #Shawls;
  };

  type Product = {
    id : Nat;
    name : Text;
    description : Text;
    image : Text;
    price : Nat;
    category : Category;
  };
  module Product {
    public func compareByPrice(a : Product, b : Product) : Order.Order {
      Nat.compare(a.price, b.price);
    };
    public func compareById(a : Product, b : Product) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  type ContactMessage = {
    name : Text;
    email : Text;
    message : Text;
  };
  type ContactInfo = {
    phone : Text;
    email : Text;
    address : Text;
  };

  let products = Map.empty<Nat, Product>();
  var nextProductId = 1;
  let contactMessages = Map.empty<Nat, ContactMessage>();

  stable var contactInfo : ContactInfo = {
    phone = "+91-123-456-7890";
    email = "support@persianthreads.com";
    address = "Srinagar, Jammu & Kashmir, India. 190001";
  };

  public shared ({ caller }) func addProduct(product : Product) : async Product {
    let id = nextProductId;
    nextProductId += 1;

    let newProduct : Product = { product with id };
    products.add(id, newProduct);
    newProduct;
  };

  public shared ({ caller }) func updateProduct(productId : Nat, product : Product) : async Product {
    if (not products.containsKey(productId)) {
      Runtime.trap("Product does not exist");
    };
    let updatedProduct : Product = { product with id = productId };
    products.add(productId, updatedProduct);
    updatedProduct;
  };

  public query ({ caller }) func getProduct(productId : Nat) : async Product {
    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product does not exist") };
      case (?product) { product };
    };
  };

  public shared ({ caller }) func removeProductsEmptyEntries() : async () {
    products.remove(0);
  };

  public shared ({ caller }) func deleteProduct(productId : Nat) : async () {
    if (not products.containsKey(productId)) {
      Runtime.trap("Product does not exist");
    };
    products.remove(productId);
  };

  public query ({ caller }) func getProductsByPrice() : async [Product] {
    products.values().toArray().sort(Product.compareByPrice);
  };

  public query ({ caller }) func getProductsByCategory(category : Category) : async [Product] {
    products.values().toArray().filter(func(product) { product.category == category });
  };

  public query ({ caller }) func getAllProducts() : async [Product] {
    let allProducts = products.values().toArray();
    allProducts.sort(Product.compareById);
  };

  public shared ({ caller }) func submitContactForm(name : Text, email : Text, message : Text) : async (
  ) {
    let contactMessage : ContactMessage = {
      name;
      email;
      message;
    };
    contactMessages.add(contactMessages.size(), contactMessage);
  };

  public query ({ caller }) func getContactInfo() : async ContactInfo {
    contactInfo;
  };

  public shared ({ caller }) func saveContactInfo(
    phone : Text,
    email : Text,
    address : Text,
  ) : async () {
    contactInfo := {
      phone;
      email;
      address;
    };
  };
};
