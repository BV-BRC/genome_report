from ete3 import Tree


with open('test.final.nwk', 'r') as f:
    newick = f.read()

t = Tree(newick)
t.render('test.svg', w=800)