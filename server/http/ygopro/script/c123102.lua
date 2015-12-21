-- Orichalcos Deuteros
function c123102.initial_effect(c)

	--activate
	local e1=Effect.CreateEffect(c)

	e1:SetType(EFFECT_TYPE_ACTIVATE)

	e1:SetCode(EVENT_FREE_CHAIN)

	e1:SetProperty(EFFECT_FLAG_CANNOT_DISABLE+EFFECT_FLAG_UNCOPYABLE)
	
                  e1:SetCost(c123102.zcost)
	
                  e1:SetTarget(c123102.ytarget)

	c:RegisterEffect(e1)

	--immune
	local e3=Effect.CreateEffect(c)

	e3:SetType(EFFECT_TYPE_SINGLE)

	e3:SetProperty(EFFECT_FLAG_SINGLE_RANGE)
	
                  e3:SetRange(LOCATION_SZONE)

	e3:SetCode(EFFECT_IMMUNE_EFFECT)
	
                  e3:SetValue(c123102.efilter)
	
                  c:RegisterEffect(e3)

	--Atk up
	local e4=Effect.CreateEffect(c)

	e4:SetType(EFFECT_TYPE_FIELD)

	e4:SetRange(LOCATION_SZONE)

	e4:SetTargetRange(LOCATION_ONFIELD,LOCATION_OFFFIELD)

	e4:SetCode(EFFECT_UPDATE_ATTACK)

	e4:SetTarget(c123102.filter)

	e4:SetValue(500)

	c:RegisterEffect(e4)

	--Def up
	local e5=Effect.CreateEffect(c)

	e5:SetType(EFFECT_TYPE_FIELD)

	e5:SetRange(LOCATION_SZONE)

	e5:SetTargetRange(LOCATION_ONFIELD,LOCATION_OFFFIELD)

	e5:SetCode(EFFECT_UPDATE_DEFENCE)
	
                  e5:SetTarget(c123102.filter)

	e5:SetValue(500)

	c:RegisterEffect(e5)

	--activation
	local e6=Effect.CreateEffect(c)

	e6:SetType(EFFECT_TYPE_FIELD)

	e6:SetCode(EFFECT_CANNOT_ACTIVATE)

	e6:SetRange(LOCATION_SZONE)

	e6:SetProperty(EFFECT_FLAG_PLAYER_TARGET)

	e6:SetTargetRange(0,1)

	e6:SetValue(c123102.dfilter)

	c:RegisterEffect(e6)

	--recover
	local e7=Effect.CreateEffect(c)

	e7:SetDescription(aux.Stringid(123102,0))

	e7:SetCategory(CATEGORY_RECOVER)

	e7:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_TRIGGER_F)

	e7:SetProperty(EFFECT_FLAG_PLAYER_TARGET+EFFECT_FLAG_REPEAT)

	e7:SetCode(EVENT_PHASE+PHASE_STANDBY)

	e7:SetRange(LOCATION_SZONE)

	e7:SetCountLimit(1)

	e7:SetCondition(c123102.econdition)

	e7:SetTarget(c123102.target)

	e7:SetOperation(c123102.eoperation)

	c:RegisterEffect(e7)

	--disable attack
	local e8=Effect.CreateEffect(c)

	e8:SetDescription(aux.Stringid(123102,0))

	e8:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_TRIGGER_O)

	e8:SetProperty(EFFECT_FLAG_CARD_TARGET)

	e8:SetCode(EVENT_ATTACK_ANNOUNCE)

	e8:SetRange(LOCATION_SZONE)
	e8:SetTarget(c123102.target)
	e8:SetCost(c123102.cost)

	e8:SetCondition(c123102.condition)

	e8:SetOperation(c123102.operation)

	c:RegisterEffect(e8)

	--self destroy
	local e9=Effect.CreateEffect(c)

	e9:SetType(EFFECT_TYPE_SINGLE)

	e9:SetCode(EFFECT_SELF_DESTROY)

	e9:SetCondition(c123102.sdcon)

	c:RegisterEffect(e9)

end
	

function c123102.efilter(e,te)
	return te:IsActiveType(TYPE_QUICKPLAY+TYPE_COUNTER+TYPE_SPELL+TYPE_TRAP+TYPE_EFFECT)

end


function c123102.filter(e,c)

	return c:IsAttribute(ATTRIBUTE_DARK+ATTRIBUTE_LIGHT+ATTRIBUTE_WATER+ATTRIBUTE_FIRE+ATTRIBUTE_EARTH+ATTRIBUTE_WIND)

end


function c123102.dfilter(e,re,tp)

	return re:GetHandler():IsType(TYPE_FIELD) and re:IsHasType(EFFECT_TYPE_ACTIVATE)
end


function c123102.ytarget(e,tp,eg,ep,ev,re,r,rp,chk,chkc)

	if chk==0 then return Duel.IsExistingMatchingCard(Card.IsDestructable,tp,LOCATION_DECK,0,1,e:GetHandler())
 end

	Duel.SetChainLimit(aux.FALSE)
end

function c123102.target(e,tp,eg,ep,ev,re,r,rp,chk)

	if chk==0 then return true
 end

	local ct=Duel.GetFieldGroupCount(tp,LOCATION_MZONE,0)

	Duel.SetTargetPlayer(tp)

	Duel.SetOperationInfo(0,CATEGORY_RECOVER,nil,0,tp,ct*500)

end


function c123102.eoperation(e,tp,eg,ep,ev,re,r,rp)

	local p=Duel.GetChainInfo(0,CHAININFO_TARGET_PLAYER)

	local ct=Duel.GetFieldGroupCount(tp,LOCATION_MZONE,0)

	Duel.Recover(p,ct*500,REASON_EFFECT)

end
function c123102.econdition(e,tp,eg,ep,ev,re,r,rp)

	return tp==Duel.GetTurnPlayer()
end

function c123102.cost(e,tp,eg,ep,ev,re,r,rp,chk)

	if chk==0 then return Duel.CheckReleaseGroup(tp,nil,1,nil)
 end

	local sg=Duel.SelectReleaseGroup(tp,nil,1,1,nil)

	Duel.Release(sg,REASON_COST)

end


function c123102.operation(e,tp,eg,ep,ev,re,r,rp)

	Duel.NegateAttack()

end


function c123102.condition(e,tp,eg,ep,ev,re,r,rp)

	return Duel.GetTurnPlayer()~=tp and Duel.GetAttackTarget()==nil
end

function c123102.costfilter(c)

	return c:IsFaceup() and c:IsCode(123103) and c:IsAbleToGraveAsCost()

end


function c123102.zcost(e,tp,eg,ep,ev,re,r,rp,chk)

	if chk==0 then return Duel.IsExistingMatchingCard(c123102.costfilter,tp,LOCATION_SZONE,0,1,nil)

	and Duel.GetFlagEffect(tp,c123103)==0 

	end

	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TOGRAVE)

	local g=Duel.SelectMatchingCard(tp,c123102.costfilter,tp,LOCATION_SZONE,0,1,1,nil)

	Duel.SendtoGrave(g,REASON_COST)

	Duel.RegisterFlagEffect(tp,c123102,RESET_PHASE+PHASE_END,0,1)

end


function c123102.vfilter(c)

	return c:IsFaceup() and c:IsCode(12395) or c:IsCode(12396) or c:IsCode(12397)

end


function c123102.sdcon(e)

	local c=e:GetHandler()

	return Duel.IsExistingMatchingCard(c123102.vfilter,c:GetControler(),0,LOCATION_MZONE,1,c)

end