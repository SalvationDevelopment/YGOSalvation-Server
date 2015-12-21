--Orichalcos Kyutora
function c123104.initial_effect(c)
	c:EnableReviveLimit()
	--special summon
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_FIELD)
	e1:SetCode(EFFECT_SPSUMMON_PROC)
	e1:SetProperty(EFFECT_FLAG_UNCOPYABLE)
	e1:SetRange(LOCATION_HAND)
	e1:SetCondition(c123104.spcon)
	e1:SetOperation(c123104.spop)
	c:RegisterEffect(e1)
	--damage reduce
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_FIELD)
	e2:SetCode(EFFECT_CHANGE_DAMAGE)
	e2:SetProperty(EFFECT_FLAG_PLAYER_TARGET)
	e2:SetRange(LOCATION_MZONE)
	e2:SetTargetRange(1,0)
	e2:SetValue(c123104.damval)
	c:RegisterEffect(e2)
	--avoid battle damage
	local e3=Effect.CreateEffect(c)
	e3:SetDescription(aux.Stringid(123104,0))
	e3:SetType(EFFECT_TYPE_CONTINUOUS+EFFECT_TYPE_FIELD)
	e3:SetRange(LOCATION_MZONE)
	e3:SetCode(EVENT_PRE_BATTLE_DAMAGE)
	e3:SetCondition(c123104.condition)
	e3:SetOperation(c123104.rdop)
	c:RegisterEffect(e3)
	--spsummon
	local e4=Effect.CreateEffect(c)
	e4:SetDescription(aux.Stringid(123104,1))
	e4:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e4:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_F)
	e4:SetCode(EVENT_LEAVE_FIELD)
	e4:SetCondition(c123104.aspcon)
	e4:SetTarget(c123104.asptg)
	e4:SetOperation(c123104.aspop)
	c:RegisterEffect(e4)	
	--suicide
	local e5=Effect.CreateEffect(c)
	e5:SetDescription(aux.Stringid(123104,1))
	e5:SetType(EFFECT_TYPE_IGNITION)
	e5:SetCategory(CATEGORY_DESTROY)
	e5:SetRange(LOCATION_MZONE)
	e5:SetTarget(c123104.destg)
	e5:SetOperation(c123104.desop)
	c:RegisterEffect(e5)
	--battle indestructable
	local e6=Effect.CreateEffect(c)
	e6:SetType(EFFECT_TYPE_SINGLE)
	e6:SetCode(EFFECT_INDESTRUCTABLE_BATTLE)
	e6:SetValue(1)
	c:RegisterEffect(e6)

end

function c123104.spcon(e,c)
	if c==nil then return true end
	local tp=c:GetControler()
	return Duel.GetLocationCount(tp,LOCATION_MZONE)>0
		and Duel.IsExistingMatchingCard(aux.TRUE,tp,LOCATION_HAND,0,1,c)
end

function c123104.spcon(e,tp,eg,ep,ev,re,r,rp)
	return Duel.IsExistingMatchingCard(c123104.cfilter,tp,LOCATION_SZONE,LOCATION_SZONE,1,nil)
end

function c123104.spop(e,tp,eg,ep,ev,re,r,rp,c,chk)
	if chk==0 then return Duel.CheckLPCost(tp,500)
	else Duel.PayLPCost(tp,500)	end
end

function c123104.ctcon(e,tp,eg,ep,ev,re,r,rp)
	return Duel.GetTurnPlayer()~=tp
end

function c123104.aspcon(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	return c:IsReason(REASON_DESTROY) and c:IsLocation(LOCATION_GRAVE) and c:GetCounter(0x52)>=5
end
function c123104.spfilter(c,e,tp)
	return c:IsCode(12399) and c:IsCanBeSpecialSummoned(e,0,tp,true,true)
end
function c123104.asptg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return true end
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,nil,1,tp,LOCATION_HAND+LOCATION_DECK+LOCATION_GRAVE)
end
function c123104.aspop(e,tp,eg,ep,ev,re,r,rp)
	local tc=Duel.GetFirstMatchingCard(c123104.spfilter,tp,LOCATION_DECK+LOCATION_HAND+LOCATION_GRAVE,0,nil,e,tp)
	if tc then
		Duel.SpecialSummon(tc,0,tp,tp,true,true,POS_FACEUP)
	end
end

function c123104.destg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return e:GetHandler():IsDestructable() end
	Duel.SetOperationInfo(0,CATEGORY_DESTROY,e:GetHandler(),1,0,0)
end
function c123104.desop(e,tp,eg,ep,ev,re,r,rp)
	Duel.Destroy(e:GetHandler(),REASON_EFFECT)
end


function c123104.damval(e,re,val,r,rp,rc)
	if bit.band(r,REASON_EFFECT)~=0 then
		e:GetHandler():AddCounter(0x52,1)
		return 0
	end
	return val
end

function c123104.rdop(e,tp,eg,ep,ev,re,r,rp)
		e:GetHandler():AddCounter(0x52,1)
		Duel.ChangeBattleDamage(tp,Duel.GetBattleDamage(tp)/0)
		e:GetHandler():RegisterFlagEffect(123104,RESET_EVENT+0x1fe0000+RESET_PHASE+PHASE_END,0,1)
end

function c123104.condition(e,tp,eg,ep,ev,re,r,rp)
	return ep==tp
end

function c123104.cfilter(c)
	return c:IsFaceup() and c:IsCode(123103) or c:IsFaceup() and c:IsCode(123102) or c:IsFaceup() and c:IsCode(123101)
end


