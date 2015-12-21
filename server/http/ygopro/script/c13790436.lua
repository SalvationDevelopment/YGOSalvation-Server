--Zefra Path
function c13790436.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetCondition(c13790436.condition)
	e1:SetOperation(c13790436.activate)
	c:RegisterEffect(e1)
	--disable spsummon
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_FIELD)
	e2:SetCode(EFFECT_CANNOT_SPECIAL_SUMMON)
	e2:SetRange(LOCATION_SZONE)
	e2:SetProperty(EFFECT_FLAG_PLAYER_TARGET)
	e2:SetTargetRange(1,1)
	e2:SetTarget(c13790436.sumlimit)
	c:RegisterEffect(e2)
	--untarget
	local e3=Effect.CreateEffect(c)
	e3:SetType(EFFECT_TYPE_SINGLE)
	e3:SetProperty(EFFECT_FLAG_SINGLE_RANGE)
	e3:SetCode(EFFECT_CANNOT_BE_EFFECT_TARGET)
	e3:SetRange(LOCATION_SZONE)
	e3:SetValue(1)
	e3:SetCondition(c13790436.untcon)
	c:RegisterEffect(e3)
	--self destroy
	local e4=Effect.CreateEffect(c)
	e4:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_CONTINUOUS)
	e4:SetRange(LOCATION_SZONE)
	e4:SetCode(EVENT_LEAVE_FIELD)
	e4:SetCondition(c13790436.sdescon)
	e4:SetOperation(c13790436.sdesop)
	c:RegisterEffect(e4)
end
function c13790436.condition(e,tp,eg,ep,ev,re,r,rp)
	local blue=Duel.GetFieldCard(tp,LOCATION_SZONE,6):GetLeftScale()
	local red=Duel.GetFieldCard(tp,LOCATION_SZONE,7):GetRightScale()
	return  (blue==1 and red==7) or (blue==7 and red==1) and Duel.GetFieldCard(tp,LOCATION_SZONE,6):IsSetCard(0xc3)
		and Duel.GetFieldCard(tp,LOCATION_SZONE,7):IsSetCard(0xc3) 
end
function c13790436.tohandfilter(c)
	return not c:IsSetCard(0xc3) and c:IsAbleToHand()
end
function c13790436.activate(e,tp,eg,ep,ev,re,r,rp)
	local g=Duel.GetMatchingGroup(c13790436.tohandfilter,tp,LOCATION_MZONE,0,nil)
	if g:GetCount()>0 then
		Duel.SendtoDeck(g,nil,2,REASON_EFFECT)
	end
end

function c13790436.sumlimit(e,c,sump,sumtype,sumpos,targetp)
	return not c:IsLocation(LOCATION_HAND+LOCATION_EXTRA)
end
function c13790436.untcon(e,tp,eg,ep,ev,re,r,rp)
    return Duel.GetFieldCard(tp,LOCATION_SZONE,6)~=nil and Duel.GetFieldCard(tp,LOCATION_SZONE,7)~=nil
end


function c13790436.sfilter(c)
	return c:IsReason(REASON_DESTROY) and c:IsPreviousLocation(LOCATION_SZONE) and c:IsType(TYPE_PENDULUM)
end
function c13790436.sdescon(e,tp,eg,ep,ev,re,r,rp)
	return eg:IsExists(c13790436.sfilter,1,nil)
end
function c13790436.sdesop(e,tp,eg,ep,ev,re,r,rp)
	Duel.Destroy(e:GetHandler(),REASON_EFFECT)
end
