--Psychic Armor Head BAAAH FIXED NYEEEE
function c110000104.initial_effect(c)
    --Restrict Attack
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_CONTINUOUS)
	e1:SetCode(EVENT_ATTACK_ANNOUNCE)
	e1:SetCondition(c110000104.racon)
	e1:SetOperation(c110000104.raop)
	c:RegisterEffect(e1)
    --Attack Redirection
    local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_O)
	e2:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e2:SetCode(EVENT_BE_BATTLE_TARGET)
	e2:SetCondition(c110000104.arcon)
	e2:SetTarget(c110000104.artar)
	e2:SetOperation(c110000104.arop)
	c:RegisterEffect(e2)
    --Special Summon
    local e3=Effect.CreateEffect(c)
	e3:SetType(EFFECT_TYPE_TRIGGER_O+EFFECT_TYPE_FIELD)
	e3:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e3:SetCode(EVENT_PHASE+PHASE_STANDBY)
	e3:SetRange(LOCATION_GRAVE)
	e3:SetCost(c110000104.cost)
	e3:SetCondition(c110000104.condition)
	e3:SetTarget(c110000104.target)
	e3:SetOperation(c110000104.operation)
	c:RegisterEffect(e3)
    --Search
	local e4=Effect.CreateEffect(c)
	e4:SetCategory(CATEGORY_TOHAND)
	e4:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_TRIGGER_O)
	e4:SetCode(EVENT_PREDRAW)
	e4:SetRange(LOCATION_MZONE)
	e4:SetCondition(c110000104.schcon)
	e4:SetTarget(c110000104.schtar)
	e4:SetOperation(c110000104.schop)
	c:RegisterEffect(e4)
	Duel.AddCustomActivityCounter(110000104,ACTIVITY_SUMMON,c110000104.counterfilter)
	Duel.AddCustomActivityCounter(110000104,ACTIVITY_SPSUMMON,c110000104.counterfilter)
	Duel.AddCustomActivityCounter(110000104,ACTIVITY_FLIPSUMMON,c110000104.counterfilter)
end
function c110000104.schcon(e,tp,eg,ep,ev,re,r,rp)
	return tp==Duel.GetTurnPlayer() and Duel.GetFieldGroupCount(tp,LOCATION_DECK,0)>0
		and Duel.GetDrawCount(tp)>0
end
function c110000104.schfilter(c)
	return c:IsSetCard(0x3A2E) and c:IsAbleToHand() and c:IsType(TYPE_MONSTER)
end
function c110000104.schtar(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(c110000104.schfilter,tp,LOCATION_DECK,0,1,nil) end
	local dt=Duel.GetDrawCount(tp)
	if dt~=0 then
		_replace_count=0
		_replace_max=dt
		local e1=Effect.CreateEffect(e:GetHandler())
		e1:SetType(EFFECT_TYPE_FIELD)
		e1:SetProperty(EFFECT_FLAG_PLAYER_TARGET)
		e1:SetCode(EFFECT_DRAW_COUNT)
		e1:SetTargetRange(1,0)
		e1:SetReset(RESET_PHASE+PHASE_DRAW)
		e1:SetValue(0)
		Duel.RegisterEffect(e1,tp)
	end
	Duel.SetOperationInfo(0,CATEGORY_TOHAND,nil,1,tp,LOCATION_DECK)
end
function c110000104.schop(e,tp,eg,ep,ev,re,r,rp)
	_replace_count=_replace_count+1
	if _replace_count>_replace_max or not e:GetHandler():IsRelateToEffect(e) or e:GetHandler():IsFacedown() then return end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_ATOHAND)
	local g=Duel.SelectMatchingCard(tp,c110000104.schfilter,tp,LOCATION_DECK,0,1,1,nil)
	if g:GetCount()>0 then
		Duel.SendtoHand(g,nil,REASON_EFFECT)
		Duel.ConfirmCards(1-tp,g)
	end
end
function c110000104.counterfilter(c)
	return c:IsSetCard(0x3A2E)
end
function c110000104.filter(c)
	return (c:GetCode()==110000104 and c:IsFaceup()) or c:IsFacedown() or (c:IsFaceup() and not c:IsSetCard(0x3A2E))
end
function c110000104.condition(e,tp,eg,ep,ev,re,r,rp)
	return tp==Duel.GetTurnPlayer() and not Duel.IsExistingMatchingCard(c110000104.filter,tp,LOCATION_MZONE,0,1,nil) 
end
function c110000104.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetCustomActivityCount(110000104,tp,ACTIVITY_SUMMON)==0
		and Duel.GetCustomActivityCount(110000104,tp,ACTIVITY_SPSUMMON)==0 
		and Duel.GetCustomActivityCount(110000104,tp,ACTIVITY_FLIPSUMMON)==0 end
	local e6=Effect.CreateEffect(e:GetHandler())
	e6:SetType(EFFECT_TYPE_FIELD)
	e6:SetProperty(EFFECT_FLAG_PLAYER_TARGET+EFFECT_FLAG_OATH)
	e6:SetCode(EFFECT_CANNOT_SPECIAL_SUMMON)
	e6:SetReset(RESET_PHASE+PHASE_END)
	e6:SetTargetRange(1,0)
	e6:SetTarget(c110000104.sumlimit)
	Duel.RegisterEffect(e6,tp)
	local e7=e6:Clone()
	e7:SetCode(EFFECT_CANNOT_SUMMON)
	Duel.RegisterEffect(e7,tp)
	local e8=e6:Clone()
	e8:SetCode(EFFECT_CANNOT_FLIP_SUMMON)
	Duel.RegisterEffect(e8,tp)
end

function c110000104.sumlimit(e,c,sump,sumtype,sumpos,targetp,se)
	return not c:IsSetCard(0x3A2E)
end
function c110000104.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetLocationCount(tp,LOCATION_MZONE)>0
		and e:GetHandler():IsCanBeSpecialSummoned(e,0,tp,false,false) end
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,e:GetHandler(),1,0,0)
end
function c110000104.operation(e,tp,eg,ep,ev,re,r,rp)
	if e:GetHandler():IsRelateToEffect(e) and not Duel.IsExistingMatchingCard(c110000104.filter,tp,LOCATION_MZONE,0,1,nil) then
		Duel.SpecialSummon(e:GetHandler(),0,tp,tp,false,false,POS_FACEUP_ATTACK)
	end
end
function c110000104.afilter(c)
    return c:IsSetCard(0x3A2E) and c:IsFaceup()
end
function c110000104.atkfilter(e,c)
    return c:IsSetCard(0x3A2E)
end
function c110000104.arcon(e,tp,eg,ep,ev,re,r,rp)
	return r~=REASON_REPLACE and Duel.GetAttackTarget()==e:GetHandler()
        and Duel.GetAttacker():IsControler(1-tp) and e:GetHandler():GetBattlePosition()~=POS_FACEDOWN_DEFENCE
end
function c110000104.artar(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsControler(tp) and chkc:IsLocation(LOCATION_MZONE) end
	if chk==0 then return Duel.IsExistingMatchingCard(c110000104.afilter,tp,LOCATION_MZONE,0,1,e:GetHandler()) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TARGET)
	Duel.SelectTarget(tp,c110000104.afilter,tp,LOCATION_MZONE,0,1,1,Duel.GetAttackTarget())
end
function c110000104.arop(e,tp,eg,ep,ev,re,r,rp)
	local tc=Duel.GetFirstTarget()
	if tc and tc:IsRelateToEffect(e) then
		Duel.ChangeAttackTarget(tc)
	end
end
function c110000104.racon(e,tp,eg,ep,ev,re,r,rp)
	return e:GetHandler()==Duel.GetAttacker()
end
function c110000104.raop(e,tp,eg,ep,ev,re,r,rp)
    local j=e:GetHandler()
	local e9=Effect.CreateEffect(e:GetHandler())
	e9:SetType(EFFECT_TYPE_FIELD)
    e9:SetRange(LOCATION_MZONE)
	e9:SetCode(EFFECT_CANNOT_ATTACK_ANNOUNCE)
	e9:SetTargetRange(LOCATION_MZONE,0)
	e9:SetReset(RESET_EVENT+0x1fe0000+RESET_PHASE+PHASE_END)
	e9:SetTarget(c110000104.atkfilter)
	j:RegisterEffect(e9)
end