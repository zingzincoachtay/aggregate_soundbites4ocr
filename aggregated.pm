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
    $this->{_buffer} = <$Fraw>; $this->{_subbuf} = $this->{_buffer}; close $Fraw;
    open my $Ftrivial, '<:encoding(UTF-8)', $this->{dictTrivial}
      or die "Could not open file '$this->{dictTrivial}' $!";
    my $exceptions = <$Ftrivial>; $this->{_exclusions} = decode_json $exceptions; close $Ftrivial;
    return bless $this, $class;
}

1;
