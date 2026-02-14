import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Migration "migration";

(with migration = Migration.run)
actor {
  // Initialize the user system state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Type
  public type UserProfile = {
    name : Text;
    email : Text;
    phone : ?Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Order Types
  public type Order = {
    orderId : Nat;
    customerId : Text;
    customerPrincipal : ?Principal;
    orderDate : Time.Time;
    totalAmount : Nat;
    items : [Item];
    status : OrderStatus;
    contactInfo : ContactInfo;
    paymentStatus : PaymentStatus;
    specialInstructions : ?Text;
  };

  public type OrderStatus = {
    #pending;
    #processing;
    #shipped;
    #delivered;
    #cancelled;
    #returned;
    #awaitingPickup;
    #outForDelivery;
  };

  public type PaymentStatus = {
    #pending;
    #paid;
    #refunded;
    #failed;
    #partiallyRefunded;
    #chargeback;
    #authorized;
    #disputed;
  };

  public type Item = {
    productId : Text;
    name : Text;
    price : Nat;
    size : ?Text;
    ingredients : [Text];
    category : ?Category;
    dietaryInfo : [BagelDietaryInfo];
    nutritionalInfo : ?BagelNutritionalInfo;
    itemType : ?ItemType;
    quantity : Nat;
  };

  public type Category = {
    #bagel;
    #creamCheese;
    #breakfastSpecial;
    #lunchSpecial;
    #beverage;
  };

  public type BagelDietaryInfo = {
    #vegan;
    #vegetarian;
    #glutenFree;
    #containsNuts;
    #dairyFree;
  };

  public type BagelNutritionalInfo = {
    calories : Nat;
    protein : Nat;
    fiber : Nat;
    carbs : Nat;
  };

  public type ItemType = {
    #classic;
    #premium;
    #stuffed;
    #gourmet;
  };

  public type Address = {
    street : Text;
    city : Text;
    zip : Text;
    addressType : ?AddressType;
  };

  public type AddressType = {
    #billing;
    #shipping;
    #pickup;
  };

  public type ContactInfo = {
    customerName : Text;
    email : Text;
    shippingAddress : Address;
    billingAddress : Address;
  };

  public type OrderCriteria = {
    #pendingOrders;
    #recentOrders;
    #customerId : Text;
    #dateRange : (Time.Time, Time.Time);
    #minimumAmount : Nat;
    #specificStatus : OrderStatus;
    #paymentStatus : PaymentStatus;
    #city : Text;
    #productId : Text;
  };

  // Order Management
  var nextOrderId = 1;
  let orders = Map.empty<Nat, Order>();

  public shared ({ caller }) func createOrder(order : Order) : async Order {
    // Public function - anyone can create an order (including guests)
    // Assign a unique orderId and capture the caller's principal
    let orderId = nextOrderId;
    nextOrderId += 1;

    let newOrder : Order = {
      order with
      orderId;
      customerPrincipal = ?caller;
      orderDate = Time.now();
      status = #pending;
      paymentStatus = #pending;
    };

    orders.add(orderId, newOrder);
    newOrder;
  };

  public shared ({ caller }) func markOrderAsPaid(orderId : Nat) : async () {
    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        // Authorization: Only the order owner or an admin can mark the order as paid
        let isOwner = switch (order.customerPrincipal) {
          case (null) { false };
          case (?principal) { principal == caller };
        };
        let isAdmin = AccessControl.isAdmin(accessControlState, caller);
        
        if (not (isOwner or isAdmin)) {
          Runtime.trap("Unauthorized: Only the order owner or an admin can mark this order as paid");
        };

        let updatedOrder = { order with paymentStatus = #paid };
        orders.add(orderId, updatedOrder);
      };
    };
  };

  public query ({ caller }) func getRazorpayKeyId() : async Text {
    // Public function - no authorization needed
    "rzp_live_SFw7mn8xjOGg07";
  };

  public query ({ caller }) func getCustomerOrders(customerId : Text) : async [Order] {
    // WARNING: This function exposes orders based on customerId rather than principal
    // It's recommended to use principal-based access control for better security
    orders.values().filter(func(order) { order.customerId == customerId }).toArray();
  };

  public query ({ caller }) func getCallerOrders() : async [Order] {
    // Users can view their own orders by Principal
    orders.values().filter(
      func(order) {
        switch (order.customerPrincipal) {
          case (null) { false };
          case (?principal) { principal == caller };
        };
      }
    ).toArray();
  };

  public query ({ caller }) func getAllOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all orders");
    };
    let allOrders = orders.values();
    allOrders.toArray();
  };

  public query ({ caller }) func getFilteredOrders(filterType : ?OrderCriteria) : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view filtered orders");
    };
    switch (filterType) {
      case (null) { orders.values().toArray() };
      case (?filter) {
        let filtered = orders.values().filter(
          func(order) {
            switch (filter) {
              case (#pendingOrders) { order.status == #pending };
              case (#recentOrders) {
                let twoWeeksAgo = Time.now() - (14 * 24 * 60 * 60 * 1_000_000_000);
                order.orderDate >= twoWeeksAgo;
              };
              case (#customerId(customerId)) {
                order.customerId == customerId;
              };
              case (#dateRange(start, end)) {
                let date = order.orderDate;
                date >= start and date <= end
              };
              case (#minimumAmount(minAmount)) {
                order.totalAmount >= minAmount
              };
              case (#specificStatus(status)) {
                order.status == status
              };
              case (#paymentStatus(paymentStatus)) {
                order.paymentStatus == paymentStatus
              };
              case (#city(city)) {
                let orderCity = order.contactInfo.shippingAddress.city;
                orderCity == city
              };
              case (#productId(productId)) {
                order.items.find(
                  func(item) {
                    item.productId == productId;
                  }
                ) != null;
              };
            };
          }
        ).toArray();
        filtered;
      };
    };
  };

  public query ({ caller }) func quickSearchOrders(searchTerm : Text) : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can search orders");
    };
    orders.values().filter(
      func(order) {
        let lowerSearchTerm = searchTerm.toLower();
        order.contactInfo.customerName.toLower().contains(#text lowerSearchTerm) or
        order.orderId.toText().contains(#text searchTerm) or
        order.items.find(
          func(item) {
            item.name.toLower().contains(#text lowerSearchTerm);
          }
        ) != null
      }
    ).toArray();
  };
};
