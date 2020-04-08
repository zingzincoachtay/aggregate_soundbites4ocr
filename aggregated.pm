package Phrases;
use JSON;
sub new {
    my $class = shift;
    my $this = {
         _r => shift
        ,rawJobDesc => '../j01.raw'
        ,dictTrivial => './trivial.json'
        ,_buffer => '',_subbuf => '',_sublines => []
        ,_exclusions => {}
        ,_sectNum => 0
        ,_dictsAllKeyW => [],_focusedAllKeyW => []
        ,_focusOneOnOne => {}
    };
    if( undef $this->{_r} ){
      print "Error in class constructor.
      Specify the numerical range of columns or the list of column names.\n";
      exit;
    }
    open my $Fraw, '<:encoding(UTF-8)', $this->{rawJobDesc}
      or die "Could not open file '$this->{rawJobDesc}' $!";
    while(<$Fraw>){ $this->{_buffer}.=$_; }
    close $Fraw;     $this->{_subbuf} = $this->{_buffer};
    open my $Ftrivial, '<:encoding(UTF-8)', $this->{dictTrivial}
      or die "Could not open file '$this->{dictTrivial}' $!";
    local $exceptions = ''; while(<$Ftrivial>){ $exceptions.=$_; }
    close $Ftrivial; $this->{_exclusions} = decode_json $exceptions;
    return bless $this, $class;
}

1;
