--属性重力－アトリビュート・グラビティ
function c511000079.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	c:RegisterEffect(e1)
	--attack	
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_CONTINUOUS)
	e2:SetCode(EVENT_ADJUST)
	e2:SetRange(LOCATION_SZONE)	
	e2:SetOperation(c511000079.operation)
	c:RegisterEffect(e2)
end
function c511000079.operation(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()	
	local wg=Duel.GetMatchingGroup(nil,c:GetControler(),LOCATION_MZONE,0,nil)
	local wg2=Duel.GetMatchingGroup(nil,c:GetControler(),0,LOCATION_MZONE,nil)
	local wbc=wg:GetFirst()
	local wbc2=wg2:GetFirst()
	while wbc do
		if wbc:IsAttackPos() and wbc:GetFlagEffect(511000079)==0 then
			if Duel.IsExistingMatchingCard(c511000079.cfilter,tp,0,LOCATION_MZONE,1,nil,wbc:GetAttribute()) then
				local e1=Effect.CreateEffect(c)
				e1:SetType(EFFECT_TYPE_SINGLE)
				e1:SetCode(EFFECT_MUST_ATTACK)
				e1:SetReset(RESET_EVENT+0x1fe0000+EVENT_ADJUST,1)
				wbc:RegisterEffect(e1) 
				local be=Effect.CreateEffect(c)
				be:SetType(EFFECT_TYPE_FIELD)
				be:SetCode(EFFECT_CANNOT_EP)
				be:SetProperty(EFFECT_FLAG_PLAYER_TARGET)
				be:SetTargetRange(1,0)
				be:SetCondition(c511000079.becon)
				be:SetReset(RESET_EVENT+0x1fe0000+EVENT_ADJUST)
				Duel.RegisterEffect(be,tp)
				wbc:RegisterFlagEffect(511000079,RESET_EVENT+0x1fe0000+EVENT_ADJUST,0,1) 
				local a=Duel.GetMatchingGroup(nil,c:GetControler(),0,LOCATION_MZONE,nil)
				local af=a:GetFirst()
				while af do
					local e2=Effect.CreateEffect(c)
					e2:SetType(EFFECT_TYPE_SINGLE)
					e2:SetCode(EFFECT_CANNOT_BE_BATTLE_TARGET)
					e2:SetProperty(EFFECT_FLAG_SINGLE_RANGE)
					e2:SetRange(LOCATION_MZONE)
					e2:SetValue(c511000079.vala)
					e2:SetReset(RESET_EVENT+0x1fe0000+EVENT_ADJUST,1)
					af:RegisterEffect(e2)
					af=a:GetNext()
				end			
			end	
		end	
		wbc=wg:GetNext()
	end		
	while wbc2 do
		if wbc2:IsAttackPos()  and wbc2:GetFlagEffect(511000079)==0 then
			if Duel.IsExistingMatchingCard(c511000079.cfilter,tp,LOCATION_MZONE,0,1,nil,wbc2:GetAttribute()) then
				local e3=Effect.CreateEffect(c)
				e3:SetType(EFFECT_TYPE_SINGLE)
				e3:SetCode(EFFECT_MUST_ATTACK)
				e3:SetReset(RESET_EVENT+0x1fe0000+EVENT_ADJUST,1)
				wbc2:RegisterEffect(e3) 
				local be=Effect.CreateEffect(c)
				be:SetType(EFFECT_TYPE_FIELD)
				be:SetCode(EFFECT_CANNOT_EP)
				be:SetProperty(EFFECT_FLAG_PLAYER_TARGET)
				be:SetTargetRange(0,1)
				be:SetCondition(c511000079.becon)
				be:SetReset(RESET_EVENT+0x1fe0000+EVENT_ADJUST)
				Duel.RegisterEffect(be,tp)
				wbc2:RegisterFlagEffect(511000079,RESET_EVENT+0x1fe0000+EVENT_ADJUST,0,1) 
				local at=Duel.GetMatchingGroup(nil,c:GetControler(),LOCATION_MZONE,0,nil)
				local atf=at:GetFirst()
				while atf do
					local e4=Effect.CreateEffect(c)
					e4:SetType(EFFECT_TYPE_SINGLE)
					e4:SetCode(EFFECT_CANNOT_BE_BATTLE_TARGET)
					e4:SetProperty(EFFECT_FLAG_SINGLE_RANGE)
					e4:SetRange(LOCATION_MZONE)
					e4:SetValue(c511000079.vala)
					atf:RegisterEffect(e4)
					atf=at:GetNext()
				end			
			end	
		end	
		wbc2=wg:GetNext()
	end	
end
function c511000079.befilter(c)
	return c:GetFlagEffect(511000079)~=0 and c:IsAttackable()
end
function c511000079.becon(e)
	return Duel.IsExistingMatchingCard(c511000079.befilter,e:GetHandlerPlayer(),0,LOCATION_MZONE,1,nil)
end
function c511000079.vala(e,c)
	return c:GetFlagEffect(511000079)~=0 and c:GetAttribute()~=e:GetHandler():GetAttribute()
end
function c511000079.cfilter(c,att)
	return c:IsAttribute(att) and c:IsFaceup()
end
