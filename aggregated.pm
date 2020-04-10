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
sub initCurrent {//_current is a dict of dict structure
  my ($saved) = @_; my $fresh = {};
  $fresh->{$_} = {} foreach @{$saved->{_r}};
  return $fresh;
}
###
###
###
sub aggregateBuffer {
  my ($saved) = @_;
  $saved->{_subbuffer} = cleanBuffer($saved->{_subbuffer},$saved->{_exclusions});
  my $current = $saved->initCurrent();
  my @lines = split /\r?\n/, $saved->{_subbuffer};
  lines.forEach((line, i) => {
    let gg = start_section(line,saved);
    if( gg.iszero && !isemptyD(current) ){
      saved.dictsKW = current;
      current = saved.initCurrent;
    }
    if( gg.ismarker ) return;
    let digest = aggregateCombination(line,saved);
    lines[i] = digest.subline;
    current = mapList(current,saved.sectK,digest.phrases);
  });
  saved.dictsKW = current;
  saved.subbuflines = lines;
  return concatRelatives(saved.dictsKW);
  return 1;
}
sub cleanBuffer {
  my ($m,$d) = @_;
  $m =~ s/ i\.?e\.?,?\b|\bi\.?e\.?,? | e\.?g\.?,?\b|\be\.?g\.?,? / /gi ;
  $m =~ s/ etc\.?\b|\betc\.? | a\.?k\.?a\.?\b|\ba\.?k\.?a\.? / /gi ;
  $m =~ s/s['’] / /gi; $m =~ s/['’](s|re|ll|ve) / /gi;
  # whole word exclusions
  for my $key (keys %$d){
    my $re = constructRegExp($d->{$key});
    $m =~ s/$re/ /gi;
  }
  return m;
}
sub constructRegExp {
  my ($r) = @_;
  local $rW = []; local $sep = ' ';
  push(@$rW, $sep.$item.'\\b|\\b'.$item.$sep) for my $item (@$r);
  return join('|',@$rW);
}

1;
