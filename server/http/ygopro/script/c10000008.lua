--The Unselected One
function c10000008.initial_effect(c)
  --Activate
  local e1=Effect.CreateEffect(c)
  e1:SetCategory(CATEGORY_DESTROY+CATEGORY_SPECIAL_SUMMON)
  e1:SetType(EFFECT_TYPE_ACTIVATE)
  e1:SetCode(EVENT_FREE_CHAIN)
  e1:SetCondition(c10000008.con)
  e1:SetCost(c10000008.cost)
  e1:SetOperation(c10000008.op)
  c:RegisterEffect(e1)
end

function c10000008.con(e,tp,eg,ep,ev,re,r,rp) 
  local c=e:GetHandler()
	local _hasMonsters = Duel.GetFieldGroupCount(c:GetControler(),0,LOCATION_MZONE)>1
  return _hasMonsters
end

function c10000008.cost(e,tp,eg,ep,ev,re,r,rp,chk)
  local c=e:GetHandler()
  if chk==0 then
    local _hasPhase = Duel.GetCurrentPhase()~=PHASE_MAIN2
    return _hasPhase
  end
  local oath=Effect.CreateEffect(c)
  oath:SetType(EFFECT_TYPE_FIELD)
  oath:SetCode(EFFECT_CANNOT_BP)
  oath:SetProperty(EFFECT_FLAG_PLAYER_TARGET+EFFECT_FLAG_OATH)
  oath:SetTargetRange(1,0)
  oath:SetReset(RESET_PHASE+PHASE_END)
  Duel.RegisterEffect(oath,tp)
end
function c10000008.filter(c)
  return true
end
function c10000008.op(e,tp,eg,ep,ev,re,r,rp)
  local c=e:GetHandler()
  
  local _hasMonsters = Duel.GetFieldGroupCount(c:GetControler(),0,LOCATION_MZONE)>1
  local _hasDestroyable = Duel.IsExistingMatchingCard(Card.IsDestructable,tp,0,LOCATION_MZONE,1,nil)
  if not (_hasMonsters or _hasDestroyable) then return end
  Duel.Hint(HINT_SELECTMSG,1-tp,HINTMSG_EFFECT)
  local _exclude = Duel.SelectMatchingCard(1-tp,c10000008.filter,1-tp,LOCATION_MZONE,0,1,1,nil)
  Duel.HintSelection(_exclude)
  Duel.Hint(HINT_SELECTMSG,1-tp,HINTMSG_DESTROY)
  local _des=Duel.SelectMatchingCard(tp,Card.IsDestructable,tp,0,LOCATION_MZONE,1,1,_exclude:GetFirst())
  local _des=_des:GetFirst()
  Duel.Destroy(_des,REASON_EFFECT)
  Duel.BreakEffect()
  local _isInGrave = _des:IsLocation(LOCATION_GRAVE)
  local _isOpponents = _des:IsControler(1-tp)
  local _canSummon = _des:IsCanBeSpecialSummoned(e,0,tp,false,false)
  local _hasZone = Duel.GetLocationCount(tp,LOCATION_MZONE)>0
  if (_isInGrave and _isOpponents and _canSummon and _hasZone) then
    Duel.SpecialSummon(_des,0,tp,tp,false,false,POS_FACEUP_ATTACK)
  end
end
