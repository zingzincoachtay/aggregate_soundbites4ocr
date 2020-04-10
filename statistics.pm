package Quantifiable;
#use JSON;
sub new {
    my $class = shift;
    my $this = {
         this._inertia => []
        ,this._ubiquity => []
    };
    return bless $this, $class;
}

1;
