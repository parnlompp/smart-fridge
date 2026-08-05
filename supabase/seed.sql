insert into public.allergies(name) values ('Peanuts'),('Tree nuts'),('Milk'),('Eggs'),('Soy'),('Wheat'),('Fish'),('Shellfish'),('Sesame') on conflict do nothing;
insert into public.ingredients(name,category) values
('Chicken breast','Meat'),('Broccoli','Vegetables'),('Carrot','Vegetables'),('Mushroom','Vegetables'),('Eggs','Dairy'),('Tomato','Vegetables'),('Pasta','Grains'),('Rice','Grains'),('Spinach','Vegetables'),('Cheese','Dairy'),('Bread','Grains'),('Onion','Vegetables'),('Milk','Dairy'),('Peanut butter','Condiments'),('Noodles','Grains'),('Soy sauce','Condiments'),('Cooking oil','Condiments'),('Garlic','Vegetables') on conflict do nothing;
-- Recipe records are seeded by name so generated UUIDs remain portable across projects.
insert into public.recipes(name,description,instructions,preparation_time,difficulty,default_servings,dietary_category) values
('Chicken & vegetable stir-fry','A quick, colourful weeknight stir-fry.','["Slice ingredients","Sear chicken","Add vegetables and sauce"]',25,'Easy',2,'No restriction'),
('Mushroom omelette','Fluffy eggs folded around savoury mushrooms.','["Sauté mushrooms","Whisk eggs","Fold and serve"]',15,'Easy',2,'Vegetarian'),
('Tomato pasta','Comforting pasta in a bright tomato sauce.','["Boil pasta","Cook sauce","Toss together"]',20,'Easy',2,'Vegan'),
('Vegetable fried rice','A fast pantry-friendly bowl.','["Sauté vegetables","Add rice","Season and serve"]',18,'Easy',2,'Vegan'),
('Spinach & cheese sandwich','A golden toasted sandwich.','["Layer ingredients","Toast until golden"]',10,'Easy',1,'Vegetarian'),
('Chicken rice bowl','A balanced bowl with tender chicken.','["Cook chicken","Warm rice","Assemble"]',30,'Medium',2,'No restriction'),
('Silky carrot soup','A warming, naturally sweet soup.','["Chop vegetables","Simmer","Blend"]',35,'Easy',4,'Vegan'),
('Egg fried rice','A satisfying classic.','["Scramble eggs","Fry rice","Combine"]',18,'Easy',2,'Vegetarian'),
('Peanut noodle bowl','Creamy noodles with crunchy vegetables.','["Boil noodles","Mix sauce","Toss"]',20,'Easy',2,'Vegan') on conflict do nothing;

update public.ingredients i set allergen_ids=array[a.id]
from public.allergies a where
  (i.name='Eggs' and a.name='Eggs') or (i.name in ('Pasta','Bread','Noodles') and a.name='Wheat') or
  (i.name in ('Cheese','Milk') and a.name='Milk') or (i.name='Peanut butter' and a.name='Peanuts') or
  (i.name='Soy sauce' and a.name='Soy');

insert into public.recipe_ingredients(recipe_id,ingredient_id,required_quantity,unit,is_optional)
select r.id,i.id,v.quantity,v.unit,v.optional
from (values
 ('Chicken & vegetable stir-fry','Chicken breast',300,'g',false),('Chicken & vegetable stir-fry','Broccoli',200,'g',false),('Chicken & vegetable stir-fry','Carrot',120,'g',false),('Chicken & vegetable stir-fry','Soy sauce',30,'ml',false),('Chicken & vegetable stir-fry','Cooking oil',15,'ml',true),
 ('Mushroom omelette','Eggs',4,'pieces',false),('Mushroom omelette','Mushroom',150,'g',false),('Mushroom omelette','Spinach',60,'g',false),
 ('Tomato pasta','Pasta',200,'g',false),('Tomato pasta','Tomato',300,'g',false),('Tomato pasta','Garlic',10,'g',false),
 ('Vegetable fried rice','Rice',250,'g',false),('Vegetable fried rice','Carrot',100,'g',false),('Vegetable fried rice','Broccoli',120,'g',false),('Vegetable fried rice','Soy sauce',20,'ml',false),
 ('Spinach & cheese sandwich','Bread',2,'pieces',false),('Spinach & cheese sandwich','Spinach',50,'g',false),('Spinach & cheese sandwich','Cheese',40,'g',false),
 ('Chicken rice bowl','Chicken breast',300,'g',false),('Chicken rice bowl','Rice',250,'g',false),('Chicken rice bowl','Broccoli',150,'g',false),('Chicken rice bowl','Soy sauce',20,'ml',false),
 ('Silky carrot soup','Carrot',500,'g',false),('Silky carrot soup','Onion',150,'g',false),('Silky carrot soup','Garlic',10,'g',true),
 ('Egg fried rice','Rice',250,'g',false),('Egg fried rice','Eggs',3,'pieces',false),('Egg fried rice','Carrot',80,'g',false),('Egg fried rice','Soy sauce',20,'ml',false),
 ('Peanut noodle bowl','Noodles',200,'g',false),('Peanut noodle bowl','Peanut butter',60,'g',false),('Peanut noodle bowl','Soy sauce',20,'ml',false),('Peanut noodle bowl','Carrot',80,'g',false)
) as v(recipe_name,ingredient_name,quantity,unit,optional)
join public.recipes r on r.name=v.recipe_name join public.ingredients i on i.name=v.ingredient_name
on conflict do nothing;

-- Auth-linked Alex rows require the project-specific user UUID. The application fixture
-- provides Alex's complete inventory and profile for credential-free presentation mode.
