import { Order } from 'order/entities/order.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  imageUrl: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @ManyToMany(() => Order, (order) => order.id)
  @JoinTable({
    name: 'order_products',
    joinColumn: {
      name: 'product_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'order_id',
      referencedColumnName: 'id',
    },
  })
  orders: Order[];
}
