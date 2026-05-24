CREATE TABLE flavor_options (
    id   BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE filling_options (
    id   BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE buttercream_options (
    id   BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

INSERT INTO flavor_options (name) VALUES
    ('Vanilla'),
    ('Chocolate'),
    ('Red Velvet'),
    ('Cookies and Cream'),
    ('Almond'),
    ('Carrot'),
    ('Marble'),
    ('Strawberry'),
    ('Lemon');

INSERT INTO filling_options (name) VALUES
    ('Raspberry Preserves'),
    ('Salted Caramel'),
    ('Strawberry Preserves'),
    ('Ganache'),
    ('Edible Cookie Dough'),
    ('Lemon Curd'),
    ('Fresh Berries'),
    ('Pastry Cream'),
    ('German');

INSERT INTO buttercream_options (name) VALUES
    ('Vanilla'),
    ('Strawberry'),
    ('Cookies and Cream'),
    ('Chocolate'),
    ('Fruity Pebbles'),
    ('Salted Caramel'),
    ('Cream Cheese'),
    ('Almond');
