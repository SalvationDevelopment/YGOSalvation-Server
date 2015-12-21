--The Seal of Orichalcos
function c123103.initial_effect(c)
	--activate
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetProperty(EFFECT_FLAG_CANNOT_DISABLE+EFFECT_FLAG_UNCOPYABLE)
	e1:SetCost(c123103.setcost)
	e1:SetTarget(c123103.ytarget)
	c:RegisterEffect(e1)
	--self destroy
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_SINGLE)
	e2:SetCode(EFFECT_SELF_DESTROY)
	e2:SetCondition(c123103.sdcon)
	c:RegisterEffect(e2)
	--immune
	local e3=Effect.CreateEffect(c)
	e3:SetType(EFFECT_TYPE_SINGLE)
	e3:SetProperty(EFFECT_FLAG_SINGLE_RANGE)
	e3:SetRange(LOCATION_SZONE)
	e3:SetCode(EFFECT_IMMUNE_EFFECT)
	e3:SetValue(c123103.efilter)
	c:RegisterEffect(e3)
	--Atk up
	local e4=Effect.CreateEffect(c)
	e4:SetType(EFFECT_TYPE_FIELD)
	e4:SetRange(LOCATION_SZONE)
	e4:SetTargetRange(LOCATION_ONFIELD,LOCATION_OFFFIELD)
	e4:SetCode(EFFECT_UPDATE_ATTACK)
	e4:SetTarget(c123103.filter)
	e4:SetValue(500)
	c:RegisterEffect(e4)
	--Def up
	local e5=Effect.CreateEffect(c)
	e5:SetType(EFFECT_TYPE_FIELD)
	e5:SetRange(LOCATION_SZONE)
	e5:SetTargetRange(LOCATION_ONFIELD,LOCATION_OFFFIELD)
	e5:SetCode(EFFECT_UPDATE_DEFENCE)
	e5:SetTarget(c123103.filter)
	e5:SetValue(500)
	c:RegisterEffect(e5)
	--activation
	local e6=Effect.CreateEffect(c)
	e6:SetType(EFFECT_TYPE_FIELD)
	e6:SetCode(EFFECT_CANNOT_ACTIVATE)
	e6:SetRange(LOCATION_SZONE)
	e6:SetProperty(EFFECT_FLAG_PLAYER_TARGET)
	e6:SetTargetRange(0,1)
	e6:SetValue(c123103.dfilter)
	c:RegisterEffect(e6)
end
	--Duel.RegisterFlagEffect(tp,c201,RESET_PHASE+PHASE_END,0,1)
function c123103.setcost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return 1==1 end
	Duel.RegisterFlagEffect(tp,c123103,RESET_PHASE+PHASE_END,0,1)
end

function c123103.efilter(e,te)
	return te:IsActiveType(TYPE_QUICKPLAY+TYPE_COUNTER+TYPE_SPELL+TYPE_TRAP+TYPE_EFFECT)
end

function c123103.filter(e,c)
	return c:IsAttribute(ATTRIBUTE_DARK+ATTRIBUTE_LIGHT+ATTRIBUTE_WATER+ATTRIBUTE_FIRE+ATTRIBUTE_EARTH+ATTRIBUTE_WIND)
end

function c123103.dfilter(e,re,tp)
	return re:GetHandler():IsType(TYPE_FIELD) and re:IsHasType(EFFECT_TYPE_ACTIVATE)
end

function c123103.ytarget(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chk==0 then return Duel.IsExistingMatchingCard(Card.IsDestructable,tp,LOCATION_DECK,0,1,e:GetHandler()) end
	Duel.SetChainLimit(aux.FALSE)
end

function c123103.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.CheckReleaseGroup(tp,nil,1,nil) end
	local sg=Duel.SelectReleaseGroup(tp,nil,1,1,nil)
	Duel.Release(sg,REASON_COST)
end

function c123103.vfilter(c)
	return c:IsFaceup() and c:IsCode(12395) or c:IsCode(12396) or c:IsCode(12397)
end

function c123103.sdcon(e)
	local c=e:GetHandler()
	return Duel.IsExistingMatchingCard(c123103.vfilter,c:GetControler(),0,LOCATION_MZONE,1,c)
end