import Map "mo:core/Map";
import Nat "mo:core/Nat";

module {
  // Old types
  type OldProduct = {
    id : Nat;
    name : Text;
    description : Text;
    price : Nat;
    category : {
      #Women;
      #Men;
      #Shawls;
    };
  };

  type OldContactMessage = {
    name : Text;
    email : Text;
    message : Text;
  };

  type OldActor = {
    products : Map.Map<Nat, OldProduct>;
    contactMessages : Map.Map<Nat, OldContactMessage>;
  };

  // New types
  type Category = {
    #Women;
    #Men;
    #Shawls;
  };

  type NewProduct = {
    id : Nat;
    name : Text;
    description : Text;
    image : Text;
    price : Nat;
    category : Category;
  };

  type NewActor = {
    products : Map.Map<Nat, NewProduct>;
    contactMessages : Map.Map<Nat, OldContactMessage>;
  };

  public func run(old : OldActor) : NewActor {
    let newProducts = old.products.map<Nat, OldProduct, NewProduct>(
      func(_id, oldProduct) {
        {
          oldProduct with
          image = "";
        };
      }
    );
    {
      old with products = newProducts;
    };
  };
};
