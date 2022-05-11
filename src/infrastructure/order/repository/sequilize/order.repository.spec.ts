import { Sequelize } from "sequelize-typescript";
import Order from "../../../../domain/checkout/entity/order";
import OrderItem from "../../../../domain/checkout/entity/order_item";
import Customer from "../../../../domain/customer/entity/customer";
import Address from "../../../../domain/customer/value-object/address";
import Product from "../../../../domain/product/entity/product";
import CustomerModel from "../../../customer/repository/sequelize/customer.model";
import CustomerRepository from "../../../customer/repository/sequelize/customer.repository";
import ProductModel from "../../../product/repository/sequelize/product.model";
import ProductRepository from "../../../product/repository/sequelize/product.repository";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";
import OrderRepository from "./order.repository";

describe("Order repository test", () => {
  let sequelize: Sequelize;

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
      sync: { force: true },
    });

    await sequelize.addModels([
      CustomerModel,
      OrderModel,
      OrderItemModel,
      ProductModel,
    ]);
    await sequelize.sync();
  });

  afterEach(async () => {
    await sequelize.close();
  });

  it("should create a new order", async () => {
    const customerRepository = new CustomerRepository();
    const customer = new Customer("123", "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);
    await customerRepository.create(customer);

    const productRepository = new ProductRepository();
    const product = new Product("123", "Product 1", 10);
    await productRepository.create(product);

    const ordemItem = new OrderItem(
      "1",
      product.name,
      product.price,
      product.id,
      2
    );

    const order = new Order("123", "123", [ordemItem]);

    const orderRepository = new OrderRepository();
    await orderRepository.create(order);

    const orderModel = await OrderModel.findOne({
      where: { id: order.id },
      include: ["items"],
    });

    expect(orderModel.toJSON()).toStrictEqual({
      id: "123",
      customer_id: "123",
      total: order.total(),
      items: [
        {
          id: ordemItem.id,
          name: ordemItem.name,
          price: ordemItem.price,
          quantity: ordemItem.quantity,
          order_id: "123",
          product_id: "123",
        },
      ],
    });
  });

  it("should update an order", async () => {
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    const customer = new Customer("123", "Customer 1", address);
    const customerRepository = new CustomerRepository();
    await customerRepository.create(customer);

    const product = new Product("123", "Product 1", 10);
    const productRepository = new ProductRepository();
    await productRepository.create(product);

    const ordemItem = new OrderItem(
        "1",
        product.name,
        product.price,
        product.id,
        2
    );

    const order = new Order("123", "123", [ordemItem]);

    const orderRepository = new OrderRepository();
    await orderRepository.create(order);

    const orderModel = await OrderModel.findOne({
      where: { id: order.id },
      include: ["items"],
    });

    expect(orderModel.toJSON()).toStrictEqual({
      id: "123",
      customer_id: "123",
      total: order.total(),
      items: [
        {
          id: ordemItem.id,
          name: ordemItem.name,
          price: ordemItem.price,
          quantity: ordemItem.quantity,
          order_id: "123",
          product_id: "123",
        },
      ],
    });

    // update section
    // change customer
    const address2 = new Address("Street 2", 2, "Zipcode 2", "City 2");
    const customer2 = new Customer("123123123", "Customer 2", address2);
    await customerRepository.create(customer2);
    order.changeCustomer(customer2.id);
    // change items
    const product2 = new Product("321", "Product 2", 50);
    await productRepository.create(product2);

    const ordemItem2 = new OrderItem(
        "2",
        product2.name,
        product2.price,
        product2.id,
        3
    );
    order.changeItems([ordemItem2]);


    await orderRepository.update(order);

    // await new Promise((resolve) => {
    //   setTimeout(resolve, 1000);
    // });

    const orderModel2 = await OrderModel.findOne({
      where: { id: order.id },
      include: ["items"],
    });

    expect(orderModel2.toJSON()).toStrictEqual({
      id: "123",
      customer_id: customer2.id,
      total: 150,
      items: [
        {
          id: ordemItem2.id,
          name: ordemItem2.name,
          price: ordemItem2.price,
          quantity: ordemItem2.quantity,
          order_id: "123",
          product_id: product2.id,
        },
      ],
    });
  }, 6000000);

  it("should find a order", async () => {
    const customer = new Customer("123", "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);
    const customerRepository = new CustomerRepository();
    await customerRepository.create(customer);

    const product = new Product("123", "Product 1", 10);
    const productRepository = new ProductRepository();
    await productRepository.create(product);

    const ordemItem = new OrderItem(
        "1",
        product.name,
        product.price,
        product.id,
        2
    );

    const order = new Order("123", "123", [ordemItem]);

    const orderRepository = new OrderRepository();
    await orderRepository.create(order);

    const orderModel = await OrderModel.findOne({
      where: { id: order.id },
      include: ["items"],
    });

    expect(orderModel.toJSON()).toStrictEqual({
      id: order.id,
      customer_id: order.customerId,
      total: order.total(),
      items: [
        {
          id: ordemItem.id,
          name: ordemItem.name,
          price: ordemItem.price,
          quantity: ordemItem.quantity,
          order_id: order.id,
          product_id: ordemItem.productId,
        },
      ],
    });
  });

  it("should find all orders", async () => {
    const customer = new Customer("123", "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);
    const customerRepository = new CustomerRepository();
    await customerRepository.create(customer);

    const product = new Product("123", "Product 1", 10);
    const productRepository = new ProductRepository();
    await productRepository.create(product);

    const ordemItem1 = new OrderItem(
        "1",
        product.name,
        product.price,
        product.id,
        2
    );
    const ordemItem2 = new OrderItem(
        "2",
        product.name,
        product.price,
        product.id,
        2
    );
    const ordemItem3 = new OrderItem(
        "3",
        product.name,
        product.price,
        product.id,
        2
    );

    const order1 = new Order("1", "123", [ordemItem1]);
    const order2 = new Order("2", "123", [ordemItem2]);
    const order3 = new Order("3", "123", [ordemItem3]);

    const orderRepository = new OrderRepository();
    await orderRepository.create(order1);
    await orderRepository.create(order2);
    await orderRepository.create(order3);

    const ordersModel = await OrderModel.findAll({
      include: ["items"],
    });

    const orderModel1 = ordersModel[0];
    expect(orderModel1.toJSON()).toStrictEqual({
      id: order1.id,
      customer_id: order1.customerId,
      total: order1.total(),
      items: [
        {
          id: ordemItem1.id,
          name: ordemItem1.name,
          price: ordemItem1.price,
          quantity: ordemItem1.quantity,
          order_id: order1.id,
          product_id: ordemItem1.productId,
        },
      ],
    });

    const orderModel2 = ordersModel[1];
    expect(orderModel2.toJSON()).toStrictEqual({
      id: order2.id,
      customer_id: order2.customerId,
      total: order2.total(),
      items: [
        {
          id: ordemItem2.id,
          name: ordemItem2.name,
          price: ordemItem2.price,
          quantity: ordemItem2.quantity,
          order_id: order2.id,
          product_id: ordemItem2.productId,
        },
      ],
    });

    const orderModel3 = ordersModel[2];
    expect(orderModel3.toJSON()).toStrictEqual({
      id: order3.id,
      customer_id: order3.customerId,
      total: order3.total(),
      items: [
        {
          id: ordemItem3.id,
          name: ordemItem3.name,
          price: ordemItem3.price,
          quantity: ordemItem3.quantity,
          order_id: order3.id,
          product_id: ordemItem3.productId,
        },
      ],
    });
  });
});
