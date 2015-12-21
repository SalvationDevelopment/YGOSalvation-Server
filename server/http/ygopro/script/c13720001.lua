--Timaeus the Knight of Destiny
function c13720001.initial_effect(c)
	aux.AddFusionProcCode3(c,80019195,13720002,13720008,true,false)
	c:EnableReviveLimit()
	--special summon
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_FIELD)
	e1:SetCode(EFFECT_SPSUMMON_PROC)
	e1:SetProperty(EFFECT_FLAG_UNCOPYABLE)
	e1:SetRange(LOCATION_EXTRA)
	e1:SetCondition(c13720001.spcon)
	e1:SetOperation(c13720001.spop)
	c:RegisterEffect(e1)
	--Cannot special summon
	local e2=Effect.CreateEffect(c)
	e2:SetProperty(EFFECT_FLAG_CANNOT_DISABLE+EFFECT_FLAG_UNCOPYABLE)
	e2:SetType(EFFECT_TYPE_SINGLE)
	e2:SetCode(EFFECT_SPSUMMON_CONDITION)
	c:RegisterEffect(e2)
	--immune
	local e3=Effect.CreateEffect(c)
	e3:SetType(EFFECT_TYPE_SINGLE)
	e3:SetProperty(EFFECT_FLAG_SINGLE_RANGE)
	e3:SetRange(LOCATION_MZONE)
	e3:SetCode(EFFECT_IMMUNE_EFFECT)
	e3:SetValue(c13720001.efilter)
	c:RegisterEffect(e3)	
	local e4=Effect.CreateEffect(c)
	e4:SetCategory(CATEGORY_ATKCHANGE)
	e4:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_QUICK_O)
	e4:SetRange(LOCATION_MZONE)
	e4:SetCode(EVENT_PRE_DAMAGE_CALCULATE)
	e4:SetCost(c13720001.cost)
	e4:SetCondition(c13720001.condition)
	e4:SetTarget(c13720001.target)
	e4:SetOperation(c13720001.operation)
	c:RegisterEffect(e4)
	local e5=Effect.CreateEffect(c)
	e5:SetDescription(aux.Stringid(97017120,0))
	e5:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e5:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_O)
	e5:SetCode(EVENT_BATTLE_DESTROYED)
	e5:SetCondition(c13720001.lkcondition)
	e5:SetTarget(c13720001.lktarget)
	e5:SetOperation(c13720001.lkoperation)
	c:RegisterEffect(e5)
end
function c13720001.spcon(e,c)
	if c==nil then return true end
	local tp=c:GetControler()
	return Duel.GetLocationCount(tp,LOCATION_MZONE)>-3
		and Duel.CheckReleaseGroup(tp,Card.IsCode,1,nil,80019195)
		and Duel.CheckReleaseGroup(tp,Card.IsCode,1,nil,13720002)
		and Duel.CheckReleaseGroup(tp,Card.IsCode,1,nil,13720008)
end
function c13720001.spop(e,tp,eg,ep,ev,re,r,rp,c)
	local g1=Duel.SelectReleaseGroup(tp,Card.IsCode,1,1,nil,80019195)
	local g2=Duel.SelectReleaseGroup(tp,Card.IsCode,1,1,nil,13720002)
	local g3=Duel.SelectReleaseGroup(tp,Card.IsCode,1,1,nil,13720008)
	g1:Merge(g2)
	g1:Merge(g3)
	Duel.SendtoGrave(g1,REASON_COST)
end

function c13720001.efilter(e,te)
	return te:GetOwner()~=e:GetOwner()
end

function c13720001.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return  e:GetHandler():GetFlagEffect(13720001)==0 end
	e:GetHandler():RegisterFlagEffect(13720001,RESET_PHASE+RESET_DAMAGE_CAL,0,1)
end
function c13720001.condition(e,tp,eg,ep,ev,re,r,rp)
	return Duel.GetAttackTarget()==e:GetHandler() or Duel.GetAttacker()==e:GetHandler()
end
function c13720001.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetAttacker():IsCanBeEffectTarget(e) end
	Duel.SetTargetCard(Duel.GetAttacker())
end
function c13720001.operation(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	if c:IsRelateToEffect(e) then
		local e1=Effect.CreateEffect(c)
		e1:SetType(EFFECT_TYPE_SINGLE)
		e1:SetCode(EFFECT_SET_ATTACK_FINAL)
		e1:SetReset(RESET_PHASE+RESET_DAMAGE_CAL)
		e1:SetValue(c13720001.adval)
		c:RegisterEffect(e1)
		local e2=e1:Clone()
		e2:SetCode(EFFECT_SET_DEFENCE_FINAL)
		c:RegisterEffect(e2)
	end
end

function c13720001.filter(c)
	return c:IsFaceup() and c:GetCode()~=13720001
end
function c13720001.adval(e,c)
	local g=Duel.GetMatchingGroup(c13720001.filter,0,LOCATION_MZONE,LOCATION_MZONE,nil)
	if g:GetCount()==0 then 
		return 0
	else
		local tg,val=g:GetMaxGroup(Card.GetAttack)
		return val
	end
end

function c13720001.lkcondition(e,tp,eg,ep,ev,re,r,rp)
	return e:GetHandler():IsLocation(LOCATION_GRAVE) and e:GetHandler():IsReason(REASON_BATTLE)
end

function c13720001.spfilter(c,e,tp)
	return c:IsSetCard(0xa0) and c:IsCanBeSpecialSummoned(e,0,tp,true,false) and not c:IsHasEffect(EFFECT_NECRO_VALLEY)
end
function c13720001.lktarget(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetLocationCount(tp,LOCATION_MZONE)>1
		and Duel.IsExistingMatchingCard(c13720001.spfilter,tp,LOCATION_DECK+LOCATION_HAND+LOCATION_GRAVE,0,3,nil,e,tp) end
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,nil,3,tp,LOCATION_DECK+LOCATION_HAND+LOCATION_GRAVE)
end
function c13720001.lkoperation(e,tp,eg,ep,ev,re,r,rp)
	if Duel.GetLocationCount(tp,LOCATION_MZONE)<3 then return end
	local g=Duel.GetMatchingGroup(c13720001.spfilter,tp,LOCATION_DECK+LOCATION_HAND+LOCATION_GRAVE,0,nil,e,tp)
	if g:GetCount()<3 then return end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
	local sg=g:Select(tp,3,3,nil)
	local tc=sg:GetFirst()
	while tc do
		Duel.SpecialSummonStep(tc,0,tp,tp,true,false,POS_FACEUP)
		tc=sg:GetNext()
	end
	Duel.SpecialSummonComplete()
end
