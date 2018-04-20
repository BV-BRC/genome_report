from ete3 import Tree, TreeStyle


with open('phylogeny_tree.nwk', 'r') as f:
    newick = f.read()


style = TreeStyle()
style.margin_right = 200

t = Tree(newick)
t.render('test-etetools-tree.svg', tree_style=style)